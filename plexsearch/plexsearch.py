import sys
import argparse
import configparser
from distutils.util import strtobool
from datetime import datetime, timedelta
import plexapi.video
from plexapi.myplex import MyPlexUser
from plexapi.exceptions import BadRequest, Unauthorized
from sqlalchemy import create_engine, MetaData
from sqlalchemy.schema import Table, Column
from sqlalchemy.types import String, Integer
from sqlalchemy.engine.url import URL
from sqlalchemy.orm import sessionmaker, mapper
from sqlalchemy.exc import SQLAlchemyError


class MediaItem(object):
    def __init__(self, title='', summary='', art='', server='', server_id='', key='', type='', link=''):
        self.title = title
        self.summary = summary
        self.art = art
        self.server = server
        self.server_id = server_id
        self.key = key
        self.type = type
        self.link = link


class PlexSearch:
    def __init__(self, config):
        try:
            # Copy the passed config into this instance of the object, checking to make sure we have everything
            self.plex_user = config['plex']['user']
            self.plex_password = config['plex']['password']
            self.db_driver = config['database']['driver']
            self.db_host = config['database']['host']
            self.db_user = config['database']['user']
            self.db_password = config['database']['password']
            self.db_name = config['database']['name']
            self.db_table = config['database']['table']
        except IndexError as error:
            sys.exit("Invalid configuration: " + str(error))

        # Connect to the Plex API
        print("Connecting to the Plex API... ", end='')
        self.plex = self._connect_plex()
        print("done!")

        # Connect to the database
        print("Connecting to the database... ", end='')
        self.db = self._connect_db()
        print("done!")

        # Define the database model
        self.db_metadata = MetaData()
        media_table = Table(self.db_table, self.db_metadata,
                            Column('id', Integer, primary_key=True),
                            Column('title', String, index=True),
                            Column('summary', String),
                            Column('art', String),
                            Column('server', String),
                            Column('server_id', String),
                            Column('key', String),
                            Column('type', String),
                            Column('link', String),
                            mysql_engine='MyISAM'
                            )

        # Drop the table, then create it again
        self._drop_table()
        self._create_table()

        # Map the database onto the MediaItem class
        mapper(MediaItem, media_table)

        # Create a new database session
        session = sessionmaker(bind=self.db)
        self.db_session = session()

    def _connect_db(self):
        """
        Attempts to connect to the database and returns the resulting connection object
        :return: SQLAlchemy Database Engine
        """
        try:
            engine = create_engine(URL(
                self.db_driver,
                username=self.db_user,
                password=self.db_password,
                host=self.db_host,
                database=self.db_name
            ))

            # Test the connection
            connection = engine.connect()
            if connection:
                connection.close()
                return engine
        except SQLAlchemyError as error:
            sys.exit("Unable to connect to the database: " + str(error))

    def _connect_plex(self):
        """
        Attempts to authenticate to the Plex API and returns the resulting MyPlexUser object
        :return: plexapi.MyPlexUser
        """
        try:
            return MyPlexUser.signin(self.plex_user, self.plex_password)
        except (Unauthorized, BadRequest) as error:
            sys.exit("Failed to authenticate to the Plex API: " + str(error))

    def _create_table(self):
        """
        Creates the media items table in the connected database
        :return: None
        """
        self.db_metadata.create_all(self.db)

    def _drop_table(self):
        """
        Deletes/drops the media items table in the connected database
        :return: None
        """
        self.db_metadata.drop_all(self.db)

    @staticmethod
    def _clean_unicode(msg):
        """
        Windows doesn't always have the correct fonts for outputting Unicode characters,
        so this encode/decode chain prevents the application from crashing when printing them.
        :param msg: String to process
        :return: Printable string
        """
        return msg.encode('utf-8', errors='ignore').decode('cp437', errors='ignore')

    def update_database(self):
        """
        Uses the Plex API to log in as the configured user, then connect to each server
        the user has access to and download a list of all available media.
        :return: None
        """
        now = datetime.utcnow()

        # Iterate over the list of servers the user has access to
        for server in self.plex.resources():
            # Only try to connect to servers that have checked in within the past 24 hours
            if server.provides == 'server' and (now - server.lastSeenAt) < timedelta(1):
                # Log the connection attempt (that encode/decode chain works around Windows not having the right fonts)
                print("Downloading metadata from: " + self._clean_unicode(server.name))

                try:
                    # Attempt to connect to the server
                    instance = server.connect()

                    # Once connected, iterate over the list of available library sections
                    for section in instance.library.sections():
                        # Iterate over each item in the section
                        for item in section.all():
                            # Create a new MediaItem object with the item's metadata
                            # noinspection PyArgumentList
                            media_item = MediaItem(
                                title=item.title,
                                summary=item.summary,
                                art=instance.url(item.art) if item.art else '',
                                server=instance.friendlyName,
                                server_id=instance.machineIdentifier,
                                key=str(item.key),
                                type=item.TYPE,
                                link=item.getStreamUrl() if type(item) is plexapi.video.Movie else ''
                            )

                            # Add the object to the database session
                            self.db_session.add(media_item)
                except Exception as error:
                    # If we couldn't connect, log the error and continue
                    print("Couldn't connect to " + self._clean_unicode(server.name) + ": " + str(error))

        # Flush the database session (commits everything to the database)
        self.db_session.commit()


def main():
    """
    Attempts to load the configuration from the file specified in the first argument,
    then creates an instance of PlexSearch and populates the database.
    :return: None
    """
    # Configure the argument parser
    parser = argparse.ArgumentParser(
        description='Download all of the metadata for the media a Plex user has access to and store it in a database.'
    )

    parser.add_argument(
        'config_file',
        type=str,
        help='configuration file containing Plex credentials and database connection information'
    )

    parser.add_argument(
        '--no-confirm',
        action='store_true',
        default=False,
        help='disable the confirmation prompt prior to destructively updating the database'
    )

    # Parse arguments
    args = parser.parse_args()
    try:
        with open(args.config_file) as config_file:
            config = configparser.ConfigParser()
            config.read_file(config_file)
    except (OSError, configparser.Error) as e:
        sys.exit("Unable to load configuration file: " + str(e))

    # Create a new PlexSearch object
    search = PlexSearch(config)

    # Ask the user before we refresh the database
    if not args.no_confirm:
        while True:
            input_confirm = input('Are you sure you want to update the database? [y/N] ')
            try:
                if input_confirm == '' or not strtobool(input_confirm):
                    sys.exit('Cancelling.')
                break
            except ValueError:
                print("Please enter a valid choice.")

    # Tell the user we're updating the table
    print("Updating the media database, this might take some time...")

    # Update the database
    search.update_database()

    # Tell the user we're done
    print("Database updated.")


if __name__ == '__main__':
    main()
