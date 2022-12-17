<?php
  session_start();
  header("content-type:application/json");

  $todo = $_GET['todo'];
  $result = array('value' => 'success');

  switch( $todo) {
    
  // *****************************************************  
  case 'getdircontents':
    $dir = urldecode($_POST['dir']);
    $only = "";
    if (isset($_POST['only'])) {
      $only = urldecode($_POST['only']);
    }
    $notdirs = "";
    if (isset($_POST['notdirs'])) {
      $notdirs = urldecode($_POST['notdirs']);
    }
    $root = $_SERVER['DOCUMENT_ROOT'] . '/';
    //$root = __DIR__ . '/';
    $fpath = $root . $dir;
    $s= '<ul class="jqueryFileTree" style="display: none;">';
    $ss= '<ul class="jqueryFileTree">';
    if( file_exists($fpath) ) {
      $files = scandir($fpath);
      natcasesort($files);
      if( count($files) > 2 ) { /* The first 2 files are . and .. */
        foreach( $files as $file ) {
          if(file_exists($fpath.$file) && $file != '.' && $file != '..') {
            if (is_dir($fpath.$file)){
              // Get all the directories in $s
              if ($notdirs === '' || strpos($file,$notdirs) === false) {
                $s .= '<li class="directory collapsed"><div rel="' . htmlentities($dir . $file) . '/">' . htmlentities($file) . '</div></li>';
              }
            } else { // not a directory so must be a file
              $ext = strtolower(preg_replace('/^.*\./', '', $file));
              if ($only === "" || strpos($only,'|'.$ext.'|') !== false) {
                $ss .= '<li class="file ext_' . $ext. '"><div rel="' . htmlentities($dir . $file) . '">' . htmlentities($file) . '</div></li>';
              }
            }
          }
        }
      }
    }
    $result['folders'] = $s . "</ul>";
    $result['theFiles'] = $ss . "</ul>";
    break;
    
  // *****************************************************  
  case 'openfile':
    $_SESSION['sfpath'] = urldecode($_POST['fpath']);
    $fpath = $_SERVER['DOCUMENT_ROOT'] . '/' . $_SESSION['sfpath'];
    if (!file_exists($fpath)) {
      $emsg="$fpath does not exist";
      goto be;
    }
    require_once 'fileClass.php';
    $mf = new fileClass($fpath);
    
    $_SESSION['fpath'] = $fpath;  
    $_SESSION['userin'] = false;

    $mf->getVars($result['ansCoder'],$result['numCats'],$result['subject'],$result['isRestricted'],
      $result['nFreeAccessQs'],$result['base'],$result['data'],$result['totalQs']);
    if ($result['isRestricted']) {
      $stored = $_POST['stored'];   // localStorage
      //$result['pointReached'] = 0;
      $ss = str_replace([" ","/",".","\\"], "_", $_SESSION['sfpath']);
      if (isset($_SESSION[$ss])) {
        if ($_SESSION[$ss] === $_SESSION['compID']) {
          $result['isRestricted'] = false;
          //$result['pointReached'] = 1;
        }
      } else if ($stored != null) {
        if ($stored === $_SESSION['compID']) {
          $_SESSION[$ss] = $_SESSION['compID'];
          $result['isRestricted'] = false;
          //$result['pointReached'] = 2;
        }
      } else if (isset($_COOKIE[$ss])) {
        if ($_COOKIE[$ss] === $_SESSION['compID']) {
          $_SESSION[$ss] = $_SESSION['compID'];
          $result['isRestricted'] = false;
          //$result['pointReached'] = 3;
        }
      }
    }
      
    //if ($result['isRestricted']) {
      $result['codeBytes'] = $mf->getcodeBytes();  // a 4 byte array
      $result['dcontact'] = $mf->getdcontact();
    //} else {
      //$result['codeBytes'] = "";
      //$result['dcontact'] = "";
    //}
    $result['cdArr'] = $mf->getCdArray();  // the code array used in switchDown
    $result['ptrArr'] = $mf->getPtrArray();
    $result['catArr'] = $mf->createCatArray();
    $result['settings'] = $mf->getSettingsArray();
    $result['filesPath'] = $mf->filesPath;
    $mf->getFontVars($result['textColor'],$result['fontName'],$result['fontSize'],
                    $result['fontBold'],$result['fontUnderline'],$result['fontItalic']);
    $mf->getFrameVars($result['FrameBorderWidth'],$result['FrameBackColor'],$result['FrameBorderColor'],
                    $result['RimWidth']);
    $mf->getBackgroundVars($result['backgroundPicture'],$result['backgroundColor'],$result['backgroundStyle'],
                            $result['backgroundSound'],$result['backQTimeSound']);
    $mf->getKeyFenceTickVars($result['keyForecolor'],$result['keyBackcolor'],$result['keyBordercolor'],
                            $result['fenceTLcolor'],$result['fenceBRcolor'],$result['tickColor']);
    $result['pwString'] = $mf->getPwString();
    break;
    
  // *****************************************************  
  case 'setFree':
    // This sets a SESSION value for a restricted-access file that has been registered
    // It also sets the cookie value if $doCookie = 1
    $doCookie = $_POST['doCookie'];
    $ss = str_replace([" ","/",".","\\"], "_", $_SESSION['sfpath']);
    if ($doCookie == 1) {
      //$result['docookie'] = $doCookie;
      //setcookie($ss, $_SESSION['compID'], time() + 5*60);   // set for 5 minutes for testing
      setcookie($ss, $_SESSION['compID'], time() + 10*365*24*60*60);   // set for 10 years
    }
    $_SESSION[$ss] = $_SESSION['compID'];
    break;
    
  // *****************************************************  
  case 'setCompID':
    // this sets $_COOKIE['compID'] and $_SESSION['compID'] which is needed to unlock restricted-access files
    if (!isset($_COOKIE['compID'])) {
      //echo 'the cookie was not set';
      $compID = mt_rand(68000000,675999000);       // 26x26x100591 to 26x26x999998
    } else {
      //echo 'the cookie was set';
      $compID = $_COOKIE['compID'];
    }
    // always set/reset the compID cookie
    setcookie('compID',$compID,time() + 10*365*24*60*60);    // 10 years, check if 10 works, seems ok
    $_SESSION['compID'] = $compID;
     // setcookie('compID','',time() - 2*60);     // deletes the existing cookie
    $result['compID'] = $compID;
    break;
    
  // *****************************************************  
  case 'setSessionCompID':
    // this sets $_SESSION['compID'] which is needed to unlock restricted-access files
    if (isset($_POST['compID'])) {
      $_SESSION['compID'] = urldecode($_POST['compID']);
    }  
    break;
    
  // *****************************************************  
/*   case 'testing':
    // 
    $ss = preg_replace('/[ -\/ \\ ]/', "_", 'a b-c/d\e');
      $ss = str_replace([" ","/",".","\\"], "_", 'a b-c/d\e');
    $result['test'] = $ss;
    break;
 */ 
    
  case 'xxx':
    break;
  }
  
goodExit:
  if (isset($_SESSION['userin'])) $result['userin'] = $_SESSION['userin'];
  echo json_encode($result);
  exit;
  
be:
  $result['value'] = 'fail';
  if (isset($emsg)) $result['emsg'] = $emsg;
  echo json_encode($result);
  exit;
?>
