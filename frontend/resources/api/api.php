<?php

require 'keys.php';


include 'tmdb-api.php';

$apikey = $tmdbKey;
$tmdb = new TMDB($apikey); // by simply giving $apikey it sets the default lang to 'en'


$db = new mysqli($host, $dbusername, $dbpassword, $dbname) or die("Connection Error: " . mysqli_error($db));

if(isset($_GET['query'])){
    $search = $db->real_escape_string($_GET['query']);
}else{
    http_response_code(501);
    die('error - q not set');
}

$query = "SELECT * FROM movieList WHERE MATCH (title) AGAINST ('$search') LIMIT 1000";

    

if(!$result = $db->query($query)){
        die(http_response_code(400));
    }
$imageBaseURL = 'http://image.tmdb.org/t/p/w185';

$arr = array();
if($result->num_rows > 0) {
	while($row = $result->fetch_assoc()) {
        $tempRow = $row;
        $title = $tempRow['title'];
        $type = $tempRow['type'];
        $counter = 0;
        if($type == "<class 'plexapi.video.Show'>"){
            $tvShows = $tmdb->searchTVShow($title);
            foreach($tvShows as $tvShow){
                if($counter == 1){
                    break;
                }
                $art = $tvShow->getPoster();
                $counter++;
            }
            
        }
        else{
            $movies = $tmdb->searchMovie($title);
            // returns an array of Movie Object
        
            foreach($movies as $movie){
                if($counter == 1){
                    break;
                }
                $art = $movie->getPoster( );
                $counter++;
            }     
        }
        
        
        if($art != NULL){
            $tempRow['art'] = $imageBaseURL.$art;
            
        }
		$arr[] = $tempRow;	
	}
}
# JSON-encode the response
$json_response = json_encode($arr);

// # Return the response
echo $json_response;



?>