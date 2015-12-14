from __future__ import print_function
from plexapi.server import PlexServer
from plexapi.myplex import MyPlexUser
from plexapi.exceptions import NotFound
import json
import sys
import MySQLdb as mdb

db_conn = None
json_config = None
with open(sys.argv[1]) as data_file:
    json_config = json.load(data_file)

def return_movie_db():
    movie_data = []

    user = MyPlexUser.signin(
            json_config['plex']['user'],
            json_config['plex']['password']
            )

    servers = user.resources()

    db_conn = None
    for server in servers:
        print("Connecting to: " + server.name)
        try:
            instance = server.connect()

            for section in instance.library.sections():
                for movie in section.all():
                    movie_data.append({
                        "title": unicode(movie.title).encode('utf-8'),
                        "summary": unicode(movie.summary).encode('utf-8'),
                        "art": unicode(movie.art).encode('utf-8'),
                        "server": unicode(instance.friendlyName).encode('utf-8')
                        })
        except Exception:
            print("Couldn't connect to: " + server.name)

    return movie_data

def connect_db():
    return mdb.connect(**json_config['mysql'])

def query_2(cursor, sql):
    global db_conn
    db_conn.ping(True)
    try:
        cursor.execute(sql)
    except Exception:
        db_conn = connect_db()
        cursor.execute(sql)

def query_3(cursor, sql, params):
    global db_conn
    db_conn.ping(True)
    try:
        cursor.execute(sql, params)
    except Exception:
        db_conn = connect_db()
        cursor.execute(sql, params)

def create_database():
    global db_conn
    db_conn = connect_db()
    c = db_conn.cursor()

    query_2(c, '''create table movieList
(rowid INT NOT NULL AUTO_INCREMENT PRIMARY KEY, title text, summary text, art
text, server text)''')

    db_conn.commit()

    c.close()

def clear_database():
    global db_conn
    db_conn = connect_db()
    c = db_conn.cursor()

    query_2(c, '''drop table movieList''')

    db_conn.commit()

    c.close()

def populate_database():
    global db_conn
    db_conn = connect_db()
    c = db_conn.cursor()

    movie_data = return_movie_db()

    for movie in movie_data:
        query_3(c, '''insert into movieList (title, summary, art, server)
values (%s, %s, %s, %s)''', (movie['title'], movie['summary'], movie['art'],
            movie['server']))

    db_conn.commit()
    c.close()

def main():
    print(json.dumps(return_movie_db(), indent=4), file=sys.stderr)

if __name__ == '__main__':
    main()
