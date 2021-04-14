<?php
  $servername = "127.0.0.1";
  $username = "mysqluser";
  $password = "mysqlpass";
  $dbname = "mysqldbname";

  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error)
  {
      die("Connection failed: " . $conn->connect_error);
  }
  
  if ($result = $conn->query("SELECT DISTINCT vl.ID, vl.Worldspace FROM vehicle_locations AS vl, vehicle_spawns AS vs WHERE vl.ID=vs.Location AND vs.MaxNum > 0;"))
  {
    $tempArray = array();
    while($row = $result->fetch_array(MYSQLI_ASSOC))
    {
      $tempArray[] = $row;
    }
    echo json_encode($tempArray);
  }
  
  $conn->close();
?>
