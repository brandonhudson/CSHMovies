<?php

require 'keys.php';

$db = new mysqli($host, $dbusername, $dbpassword, $dbname) or die("Connection Error: " . mysqli_error($db));

if(isset($_GET['q'])){
    $search = $db->real_escape_string($_GET['q']);
}else{
    die(http_response_code(500));
}

$query = "SELECT rowid,title,summary,art,server FROM $table WHERE MATCH (title) AGAINST($q) LIMIT 1000"
    
if(!$result = $db->query($query)){
        die(http_response_code(400));
    }

$arr = array();
if($result->num_rows > 0) {
	while($row = $result->fetch_assoc()) {
		$arr[] = $row;	
	}
}
# JSON-encode the response
$json_response = json_encode($arr);

// # Return the response
echo $json_response;



?>