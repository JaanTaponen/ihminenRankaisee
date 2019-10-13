<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$db = "testing";

// Create connection
$conn = new mysqli($servername, $username, $password,$db);
$conn->set_charset('utf8mb4');
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$result = mysqli_query($conn, "SELECT * FROM adressi");   
while($row = mysqli_fetch_assoc($result))
    $test[] = $row; 
print json_encode($test);


?>