<?php
include("../db.php");
$data = read_json_body();

$required = ["movie_id", "theater_id", "show_time"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$movie_id = mysqli_real_escape_string($conn, isset($data['movie_id'])?$data['movie_id']:'');
$theater_id = mysqli_real_escape_string($conn, isset($data['theater_id'])?$data['theater_id']:'');
$show_time = mysqli_real_escape_string($conn, isset($data['show_time'])?$data['show_time']:'');

$sql = "INSERT INTO showtimes (movie_id, theater_id, show_time) VALUES ('$movie_id', '$theater_id', '$show_time')";
if (mysqli_query($conn, $sql)) {
    $id = mysqli_insert_id($conn);
    respond(["status"=>"success","id"=>$id]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>