<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
include('connectSQL.php');
$fullQuery = 'dgsfxrgfrdsdgdfg';
$data = $conn->query($fullQuery);
echo json_encode($data);

?>