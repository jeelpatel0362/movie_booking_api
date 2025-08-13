<?php
include("../db.php");
$data = read_json_body();

$required = ["id", "booking_id", "amount", "status"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$id = intval($data['id']);
$booking_id = mysqli_real_escape_string($conn, isset($data['booking_id'])?$data['booking_id']:'');
$amount = mysqli_real_escape_string($conn, isset($data['amount'])?$data['amount']:'');
$status = mysqli_real_escape_string($conn, isset($data['status'])?$data['status']:'');

$sql = "UPDATE payments SET booking_id='$booking_id', amount='$amount', status='$status' WHERE id={$id}";
if (mysqli_query($conn, $sql)) {
    respond(["status"=>"success","message"=>"Updated"]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>