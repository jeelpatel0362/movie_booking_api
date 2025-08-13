<?php
include("../db.php");
$data = read_json_body();

$required = ["user_id", "showtime_id", "seats"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$user_id = mysqli_real_escape_string($conn, isset($data['user_id'])?$data['user_id']:'');
$showtime_id = mysqli_real_escape_string($conn, isset($data['showtime_id'])?$data['showtime_id']:'');
$seats = mysqli_real_escape_string($conn, isset($data['seats'])?$data['seats']:'');

$sql = "INSERT INTO bookings (user_id, showtime_id, seats) VALUES ('$user_id', '$showtime_id', '$seats')";
if (mysqli_query($conn, $sql)) {
    $id = mysqli_insert_id($conn);
    respond(["status"=>"success","id"=>$id]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>