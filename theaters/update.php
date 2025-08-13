<?php
include("../db.php");
$data = read_json_body();

$required = ["id", "name", "location"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$id = intval($data['id']);
$name = mysqli_real_escape_string($conn, isset($data['name'])?$data['name']:'');
$location = mysqli_real_escape_string($conn, isset($data['location'])?$data['location']:'');

$sql = "UPDATE theaters SET name='$name', location='$location' WHERE id={$id}";
if (mysqli_query($conn, $sql)) {
    respond(["status"=>"success","message"=>"Updated"]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>