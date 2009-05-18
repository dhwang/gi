<?php

if (!isset($_POST["id"]))
{
  ?>No ID information, is this an JsUnit report<?php
  return;
}
/****/
$errors = 0; // Total errors tests
$fails = 0;  // Total failed tests
$tests = 0;  // Total tests ran

/** getBrowserInfo - determine the browser information
*/
function getBrowserInfo() {
    $SUPERCLASS_NAMES  = "gecko,mozilla,mosaic,webkit";
    $SUPERCLASSES_REGX = "(?:".str_replace(",", ")|(?:", $SUPERCLASS_NAMES).")";

    $SUBCLASS_NAMES    = "opera,msie,firefox,chrome,safari";
    $SUBCLASSES_REGX   = "(?:".str_replace(",", ")|(?:", $SUBCLASS_NAMES).")";

    $browser      = "unsupported";
    $majorVersion = "0";
    $minorVersion = "0";
    $fullVersion  = "0.0";
    $os           = 'unsupported';

    $userAgent    = strtolower($_SERVER['HTTP_USER_AGENT']);

    $found = preg_match("/(?P<browser>".$SUBCLASSES_REGX.")(?:\D*)(?P<majorVersion>\d*)(?P<minorVersion>(?:\.\d*)*)/i",
$userAgent, $matches);
    if (!$found) {
        $found = preg_match("/(?P<browser>".$SUPERCLASSES_REGX.")(?:\D*)(?P<majorVersion>\d*)(?P<minorVersion>(?:\.\d*)*)/i",
$userAgent, $matches);
    }

    if ($found) {
        $browser      = $matches["browser"];
        $majorVersion = $matches["majorVersion"];
        $minorVersion = $matches["minorVersion"];
        $fullVersion  = $matches["majorVersion"].$matches["minorVersion"];
        if ($browser != "safari") {
            if (preg_match("/version\/(?P<majorVersion>\d*)(?P<minorVersion>(?:\.\d*)*)/i",
$userAgent, $matches)){
                $majorVersion = $matches["majorVersion"];
                $minorVersion = $matches["minorVersion"];
                $fullVersion  = $majorVersion.".".$minorVersion;
            }
        }
    }

    if (strpos($userAgent, 'linux')) {
        $os = 'linux';
    }
    else if (strpos($userAgent, 'macintosh') || strpos($userAgent, 'mac os x')) {
        $os = 'mac';
    }
    else if (strpos($userAgent, 'windows') || strpos($userAgent, 'win32')) {
        $os = 'windows';
    }

    return array(
        "browser"      => $browser,
        "majorVersion" => $majorVersion,
        "minorVersion" => $minorVersion,
        "fullVersion"  => $fullVersion,
        "os"           => $os);
}

function getFailedCount($val, $key) {
global $errors, $fails, $tests;
    if (strpos($val, "|E") != false) {
	   $errors++;
	}else
	if (strpos($val, "|F") != false) {
		$fails++;
	}
	//$tests = $key; // keep updating tests counts with testcase index.
	//echo $val . ",errors:". $errors . ",fails:". $fails;
}

function write_testcase($val, $key, $handle) {
//jsx3.lang.Package:testStaticFields|0.003|S||

   $testcase = split("\|", $val);
   $testname = $testcase[0];
   $testtime = $testcase[1];
   $teststat = $testcase[2];
   $xText = "<testcase/>\n";
   $nameparts = split(":", $testname);
   $class = $nameparts[0];
   $name = $nameparts[1];
   if ($teststat == "S") {
     $xText = "<testcase id=\"$key\" classname=\"$class\" name=\"$name\" time=\"$testtime\" status=\"$teststat\"/>\n";
   } else {
	  $xText = "<testcase id=\"$key\" classname=\"$class\" name=\"$name\" time=\"$testtime\" status=\"$teststat\">\n";
	  if ($teststat == "F") {
	    $xText = $xText."<failure type=\"failure\"><![CDATA[". $testcase[3] ."]]></failure>\n";
	  } else if ($teststat == "E") {
	    $xText = $xText."<failure type=\"error\"><![CDATA[". $testcase[3] ."]]></failure>\n";
	  }
	  $xText = $xText."</testcase>\n";
	}

	$writer = fwrite($handle, $xText);

}

// print to stdout array walk (item, key)
function resp_print($item, $key)
{
   echo "<b>$key</b>: $item<br />";
}
/****************************/
/* START MAIN  */
/****************************/


$info = getBrowserInfo();
$mybrowser = $info["os"]."-".$info["browser"]."-".$info["majorVersion"].$info["minorVersion"]."-". time()  ;

$runId = $_POST["id"];
$totalTime =$_POST["time"];
$userAgent = $_POST["userAgent"];
$JsUnitVersion = $_POST["JsUnitVersion"];
$baseURL= $_POST["baseURL"];
$URL = parse_url($baseURL);
$host = $_SERVER['HTTP_HOST'];
// Calculated after scanning the results
$tests = count($_POST['testCases']);

// count the failed and errored tests
array_walk($_POST['testCases'], 'getFailedCount');

$headerText = "<?xml version=\"1.0\" ?>\n<testsuites>\n";
$suiteText =
	"<testsuite id=\"$mybrowser\" name=\"$runId\" tests=\"$tests\" errors=\"$errors\" failures=\"$fails\" time=\"$totalTime\">\n".
	"<properties>\n".
	"<property name=\"userAgent\" value=\"". $_SERVER['HTTP_USER_AGENT'] . "\" />\n" .
	"<property name=\"host\" value=\"$host\" />\n" .
	"<property name=\"baseURL\" value=\"$baseURL\" />\n" .
	"</properties>\n".
	" ";
$endText = "</testsuite>\n</testsuites>\n";
// create directory if doesn't exist
$dirpath = 'test-reports';
if( !is_dir( $dirpath ) ) {
	mkdir($dirpath);
}

// Write to file
$filename = $dirpath ."/TestResults-".$mybrowser.".xml";
$handle = fopen($filename, "w");
$writer = fwrite($handle, $headerText);
$writer = fwrite($handle, $suiteText);
array_walk($_POST["testCases"], "write_testcase", $handle);
$writer = fwrite($handle, $endText);
fclose($handle);
$url = "http://".$host. substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/'));;


// Write to stdout, which gets sent back to HTML browser client
echo "<html><body>"; // Need the css style sheet
resp_print("<a href=\"".$url."/".$filename."\">".$url."/".$filename."</a>" , "URL: ");
resp_print($filename, "File: ");
resp_print($_SERVER['HTTP_USER_AGENT'], "Browser: ");
//array_walk($_POST, 'resp_print');
echo "</body></html>";
?>
