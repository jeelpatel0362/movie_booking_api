<?php
include("../db.php");
if (!isset($_GET['id'])) { respond(["status"=>"error","message"=>"id is required"], 400); }
$id = intval($_GET['id']);
$result = mysqli_query($conn, "SELECT * FROM payments WHERE id={$id}");
if ($result && mysqli_num_rows($result) > 0) {
    respond(mysqli_fetch_assoc($result));
} else {
    respond(["status"=>"error","message"=>"Not found"], 404);
}
?>