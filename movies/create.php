<?php
include("../db.php");
$data = read_json_body();

$required = ["title", "duration"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$title = mysqli_real_escape_string($conn, isset($data['title'])?$data['title']:'');
$duration = mysqli_real_escape_string($conn, isset($data['duration'])?$data['duration']:'');
$genre = mysqli_real_escape_string($conn, isset($data['genre'])?$data['genre']:'');

$sql = "INSERT INTO movies (title, duration, genre) VALUES ('$title', '$duration', '$genre')";
if (mysqli_query($conn, $sql)) {
    $id = mysqli_insert_id($conn);
    respond(["status"=>"success","id"=>$id]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>