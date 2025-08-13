<?php
include("../db.php");
$data = read_json_body();

$required = ["id", "title", "duration", "genre"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$id = intval($data['id']);
$title = mysqli_real_escape_string($conn, isset($data['title'])?$data['title']:'');
$duration = mysqli_real_escape_string($conn, isset($data['duration'])?$data['duration']:'');
$genre = mysqli_real_escape_string($conn, isset($data['genre'])?$data['genre']:'');

$sql = "UPDATE movies SET title='$title', duration='$duration', genre='$genre' WHERE id={$id}";
if (mysqli_query($conn, $sql)) {
    respond(["status"=>"success","message"=>"Updated"]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>