<?php
include("../db.php");
$result = mysqli_query($conn, "SELECT * FROM users");
$rows = [];
if ($result) {
    while ($r = mysqli_fetch_assoc($result)) { $rows[] = $r; }
}
respond($rows);
?>