<?php
include("../db.php");
if (!isset($_GET['id'])) { respond(["status"=>"error","message"=>"id is required"], 400); }
$id = intval($_GET['id']);
$sql = "DELETE FROM theaters WHERE id={$id}";
if (mysqli_query($conn, $sql)) {
    respond(["status"=>"success","message"=>"Deleted"]);
} else {
    respond(["status"=>"error","message"=>mysqli_error($conn)], 500);
}
?>