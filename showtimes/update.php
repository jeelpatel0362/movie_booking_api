<?php
include("../db.php");
$data = read_json_body();

$required = ["id", "movie_id", "theater_id", "show_time"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$id = intval($data['id']);
$movie_id = mysqli_real_escape_string($conn, isset($data['movie_id'])?$data['movie_id']:'');
$theater_id = mysqli_real_escape_string($conn, isset($data['theater_id'])?$data['theater_id']:'');
$show_time = mysqli_real_escape_string($conn, isset($data['show_time'])?$data['show_time']:'');

$sql = "UPDATE showtimes SET movie_id='$movie_id', theater_id='$theater_id', show_time='$show_time' WHERE id={$id}";
if (mysqli_query($conn, $sql)) {
    respond(["status"=>"success","message"=>"Updated"]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>