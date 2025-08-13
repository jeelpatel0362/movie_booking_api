<?php
include("../db.php");
$data = read_json_body();

$required = ["booking_id", "amount"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$booking_id = mysqli_real_escape_string($conn, isset($data['booking_id'])?$data['booking_id']:'');
$amount = mysqli_real_escape_string($conn, isset($data['amount'])?$data['amount']:'');
$status = mysqli_real_escape_string($conn, isset($data['status'])?$data['status']:'');

$sql = "INSERT INTO payments (booking_id, amount, status) VALUES ('$booking_id', '$amount', '$status')";
if (mysqli_query($conn, $sql)) {
    $id = mysqli_insert_id($conn);
    respond(["status"=>"success","id"=>$id]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>