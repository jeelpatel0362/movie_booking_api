<?php
include("../db.php");
$data = read_json_body();

$required = ["name", "location"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$name = mysqli_real_escape_string($conn, isset($data['name'])?$data['name']:'');
$location = mysqli_real_escape_string($conn, isset($data['location'])?$data['location']:'');

$sql = "INSERT INTO theaters (name, location) VALUES ('$name', '$location')";
if (mysqli_query($conn, $sql)) {
    $id = mysqli_insert_id($conn);
    respond(["status"=>"success","id"=>$id]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>