<?php
function issetOr($var, $or = false) {
  return isset($var) ? $var : $or;
}

$status = issetOr($_GET['status'], "200");
if ($status == "500") {
  header("HTTP/1.0 ". $status . " Server Error");
  $xml = "wsdl2fault.xml";
} else {
  $xml = "wsdl2msg.xml";
}

header("Content-type: text/xml");
$fh = fopen($xml, 'r');
$theData = fread($fh, filesize($xml));
fclose($fh);
echo $theData;
//echo "END";

?>
