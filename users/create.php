<?php
include("../db.php");
$data = read_json_body();

$required = ["name", "email", "password"];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === "") {
        respond(["status"=>"error","message"=>"Missing field: ".$field], 400);
    }
}

$name = mysqli_real_escape_string($conn, isset($data['name'])?$data['name']:'');
$email = mysqli_real_escape_string($conn, isset($data['email'])?$data['email']:'');
$password = password_hash($data['password'], PASSWORD_DEFAULT);

$sql = "INSERT INTO users (name, email, password) VALUES ('$name', '$email', '$password')";
if (mysqli_query($conn, $sql)) {
    $id = mysqli_insert_id($conn);
    respond(["status"=>"success","id"=>$id]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>