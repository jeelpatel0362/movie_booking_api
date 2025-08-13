<?php
include("../db.php");
$data = read_json_body();

$required = ["id", "user_id", "showtime_id", "seats"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$id = intval($data['id']);
$user_id = mysqli_real_escape_string($conn, isset($data['user_id'])?$data['user_id']:'');
$showtime_id = mysqli_real_escape_string($conn, isset($data['showtime_id'])?$data['showtime_id']:'');
$seats = mysqli_real_escape_string($conn, isset($data['seats'])?$data['seats']:'');

$sql = "UPDATE bookings SET user_id='$user_id', showtime_id='$showtime_id', seats='$seats' WHERE id={$id}";
if (mysqli_query($conn, $sql)) {
    respond(["status"=>"success","message"=>"Updated"]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>