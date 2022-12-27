<?php
  session_start();
  header("content-type:application/json");
  
  $data = json_decode(file_get_contents('php://input'), true);

  $todo = $_GET['todo'];
  $result = array('value' => 'success');

  switch( $todo) {
    
  // *****************************************************  
  case 'getdircontents':
  
    $dir = $data['dir'];
    //$dir = urldecode($_POST['dir']);
    $only = "";
    if (isset($data['only'])) {
      $only = urldecode($data['only']);
    }
    $notdirs = "";
    if (isset($data['notdirs'])) {
      $notdirs = urldecode($data['notdirs']);
    }
  
  
    
    $root = $_SERVER['DOCUMENT_ROOT'] . '/';
    //$root = __DIR__ . '/';
    $fpath = $root . $dir;
    
    $result['hasPath'] = '';
    
    $foldersArr = [];
    $filesArr = [];
    //$s= '<ul class="fileTree" style="display: none;">';
    //$ss= '<ul class="fileTree">';
    if( file_exists($fpath) ) {
      $files = scandir($fpath);
      natcasesort($files);
      if( count($files) > 2 ) { /* The first 2 files are . and .. */
        foreach( $files as $file ) {
          if(file_exists($fpath.$file) && $file != '.' && $file != '..') {
            if (is_dir($fpath.$file)){
              // Get all the directories in $s
              if ($notdirs === '' || strpos($file,$notdirs) === false) {
                $foldersArr[] = $file;
                $foldersArr[] = hasSubs($fpath  . $file . '/', $notdirs);
                
                //$s .= '<li class="directory collapsed"><div rel="' . htmlentities($dir . $file) . '/">' . htmlentities($file) . '</div></li>';
              }
            } else { // not a directory so must be a file
              $ext = strtolower(preg_replace('/^.*\./', '', $file));
              if ($only === "" || strpos($only,'|'.$ext.'|') !== false) {
                $filesArr[] = $file;
                $filesArr[] = $ext;
                //$ss .= '<li class="file ext_' . $ext. '"><div rel="' . htmlentities($dir . $file) . '">' . htmlentities($file) . '</div></li>';
              }
            }
          }
        }
      }
    }
    //$result['folders'] = $s . "</ul>";
    //$result['files'] = $ss . "</ul>";
    $result['folders'] = $foldersArr;
    $result['files'] = $filesArr;
    
    break;
   
  // *****************************************************  
  case 'getFolders':

  
    $f = array(0 => "rootDir");
    $pn = array(0 => 0);
    $ps = array(0 => 0);
    $nexti = 1;
    
    
    $dir = $data['dir'];
    // $dir = urldecode($_POST['dir']);
    $only = "";
    if (isset($data['only'])) {
      $only = urldecode($data['only']);
    }
    $notdirs = "";
    if (isset($data['notdirs'])) {
      $notdirs = urldecode($data['notdirs']);
    }
    
    $root = $_SERVER['DOCUMENT_ROOT'] . '/';
    //$root = __DIR__ . '/';
    $fpath = $root . $dir;
    
    //doFolder($fpath,0);
    //doFolder2($fpath,0);
    doFolder3($fpath,0);
    
    $result['f'] = $f;
    $result['pn'] = $pn;
    $result['ps'] = $ps;
    
    break;
    
  // *****************************************************  
  case 'getFiles':
  
    $dir = $data['dir'];
    //$dir = urldecode($_POST['dir']);
    $only = "";
    if (isset($data['only'])) {
      $only = urldecode($data['only']);
    }
    $root = $_SERVER['DOCUMENT_ROOT'] . '/';
    //$root = __DIR__ . '/';
    $fpath = $root . $dir;
    $filesArr = [];
    if( file_exists($fpath) ) {
      $files = scandir($fpath);
      natcasesort($files);
      if( count($files) > 2 ) { /* The first 2 files are . and .. */
        foreach( $files as $file ) {
          if(file_exists($fpath.$file) && $file != '.' && $file != '..') {
            // only look for files and not directories
            //if (is_file($fpath.$file)){   // better to use !is_dir()
            if (!is_dir($fpath.$file)){
              $ext = strtolower(preg_replace('/^.*\./', '', $file));
              if ($only === "" || strpos($only,'|'.$ext.'|') !== false) {
                $filesArr[] = $file;
                $filesArr[] = $ext;
              }
            }
          }
        }
      }
    }
    $result['files'] = $filesArr;
    
    break;
   
  // *****************************************************  
  case 'openfile':
    $_SESSION['sfpath'] = urldecode($_POST['fpath']);
    $fpath = $_SERVER['DOCUMENT_ROOT'] . '/' . $_SESSION['sfpath'];
    if (!file_exists($fpath)) {
      $errmsg="$fpath does not exist";
      goto be;
    }
    require_once 'fileClass.php';
    $mf = new fileClass($fpath);
    
    $_SESSION['fpath'] = $fpath;  
    $_SESSION['userin'] = false;

    $mf->getVars($result['ansCoder'],$result['numCats'],$result['subject'],$result['isRestricted'],
      $result['nFreeAccessQs'],$result['base'],$result['data'],$result['totalQs']);
    if ($result['isRestricted']) {
      //$result['pointReached'] = 0;
      $ss = str_replace([" ","/",".","\\"], "_", $_SESSION['sfpath']);
      if (isset($_SESSION[$ss])) {
        if ($_SESSION[$ss] === $_SESSION['compID']) {
          $result['isRestricted'] = false;
          //$result['pointReached'] = 1;
        }
      } else {
        if (isset($_COOKIE[$ss])) {
          if ($_COOKIE[$ss] === $_SESSION['compID']) {
            $_SESSION[$ss] = $_SESSION['compID'];
            $result['isRestricted'] = false;
            //$result['pointReached'] = 2;
          }
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
  case 'setCookie':
    // This must set a cookie for a restricted-access file that has been registered
    $ss = str_replace([" ","/",".","\\"], "_", $_SESSION['sfpath']);
    //setcookie($ss, $_SESSION['compID'], time() + 5*60);   // set for 5 minutes
    setcookie($ss, $_SESSION['compID'], time() + 5*60);   // set for 5 minutes
    $_SESSION[$ss] = $_SESSION['compID'];
    break;
    
  // *****************************************************  
/*   case 'testing':
    // 
    $ss = preg_replace('/[ -\/ \\ ]/', "_", 'a b-c/d\e');
      $ss = str_replace([" ","/",".","\\"], "_", 'a b-c/d\e');
    $result['test'] = $ss;
    break;
 */    
  // *****************************************************  
/*   case 'getdcontact':    // also returns the computer id
    require_once 'fileClass.php';
    $mf = new fileClass2($_SESSION['fpath']);
    $mf->getdcontact($dcontact);
    $s = "<b>Name: " . $dcontact[1] . "</b><br>";
    $s .= "<b>Contact: " . $dcontact[2];
    if ($dcontact[3] != '') {$s .= ", " . $dcontact[3]; }
    if ($dcontact[4] != '') {$s .= ", " . $dcontact[4]; }
    if ($dcontact[5] != '') {$s .= ", " . $dcontact[5]; }
    if ($dcontact[6] != '') {$s .= ", " . $dcontact[6]; }
    $s .= "</b>";
    $result['dcontact'] = $s;
    $result['compID'] = $_SESSION['compID'];
    break;
 */    

 // *****************************************************  
  case 'update_finfo':
    // This must read the files that are already in the database and check this list against
    // the files in their present location. The following logic is used
    // 1) If there is a file already in the database then compare the codebytes. If they are the same 
    // then leave as is, ie there is no need to do anything. If the codebytes are different then change
    // the codebytes but report that this has happened.
    // 2) If the codebytes of a file are the same as the codebytes of a file in the database then
    //    a) If the file names are the same then it means that their location is different, ie the
    //       file has been moved. In this case replace the file in its same position in the database.
    //    b) If the file names are different then treat this as a new file and leave the other file
    //       in the database at its same position.
    // 3) If you reach this point then the codebytes are different and the file names are different
    // so this is just like adding a new file.
  // $result['point'] = '1';
    require_once 'checkDB.php';
  // $result['point'] .= ' '.'2';
    // Connect to the database
    $mc =  connectToDB();
    if ($mc->connect_errno) {
      die('Connect Error (' . $mc->connect_errno . ') ' . $mc->connect_error);
      $errmsg="Connect error: " . $mc->connect_error;
      goto be;
    }
  // $result['point'] .= ' '.'3';
    $sql="SELECT fid, fpath, cd1, cd2, cd3, cd4 FROM finfo2";
    
    $stmt = $mc->stmt_init();   // this is optional but good practice, next must be prepare
    if($stmt->prepare($sql) === false) {
      trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $mc->errno . ' ' . $mc->error, E_USER_ERROR);
      $errmsg='Wrong SQL: ' . $sql . ' Error: ' . $mc->errno . ' ' . $mc->error;
      goto be;
    }
    $stmt->bind_result($fid,$dbfpath,$dbcodebytes[1],$dbcodebytes[2],$dbcodebytes[3],$dbcodebytes[4]);
    $stmt->execute();
    $c = 0;
    $s = '';
    while ($stmt->fetch()) {
      $c++;
      $farr[$c] = $dbfpath;
      $dbcbarr[$c][1] = $dbcodebytes[1];
      $dbcbarr[$c][2] = $dbcodebytes[2];
      $dbcbarr[$c][3] = $dbcodebytes[3];
      $dbcbarr[$c][4] = $dbcodebytes[4];
      //$s .= $fpath . ' ';
    }
    
    //$stmt->close();
    
  // $result['point'] .= ' '.'4';
    
    $only = "";
    if (isset($_POST['only'])) {
      $only = urldecode($_POST['only']);
    }
    $notdirs = "";
    if (isset($_POST['notdirs'])) {
      $notdirs = urldecode($_POST['notdirs']);
    }
    $root = $_SERVER['DOCUMENT_ROOT'] . '/';
    $n = strlen($root);
    $arr[0] = $root.urldecode($_POST['fpath']);
    $i = 0;
    $next = 1;
    $ss = '';
    $fcount = 0;
    $newcount = 0;
    
    require_once 'fileClass.php';
    require_once 'myencrypt.php';
    
  // $result['point'] .= ' '.'5';
    $update_report = '';
    while($i < $next) {
      $fpath = $arr[$i];
      if( file_exists($fpath) ) {
        $files = scandir($fpath);
        if( count($files) > 2 ) { /* The 2 accounts for . and .. */
          foreach( $files as $file ) {
            if(file_exists($fpath.$file) && $file != '.' && $file != '..') {
              if (is_dir($fpath.$file)){
                // Put the directories in $arr[]
                if ($notdirs === '' || strpos($file,$notdirs) === false) {
                  $arr[$next] = $fpath.$file.'/';
                  $next++;
                }
              } else {  // not a directory so must be a file
                $ext = strtolower(preg_replace('/^.*\./', '', $file));
                if ($only === "" || strpos($only,'|'.$ext.'|') !== false) {
                  $ss = substr($fpath . $file, $n);
                  $update_report .= '<h4 style="white-space: nowrap;margin-bottom:2px;margin-top:8px;">'.++$fcount.') '.$ss.'</h4>';
                  $ss = strtolower($ss);
                  $isIn = false;
                  for ($j = 1; $j <= $c; $j++) {
                    if ($ss === $farr[$j]) {
                      $dbcodebytes = $dbcbarr[$j];
                      $isIn = true;
                      break;
                    }
                  }
                  $mf = new fileClass2($fpath . $file);
                  $mf->getcodebytes($codebytes);
                  
                  if ($isIn) { // the full filepath is in
                    $update_report .= 'Is already in the database<br>';
                  
                    if (codebytes_same($dbcodebytes,$codebytes)) {
                      $update_report .= 'Code bytes are the same<br>';
                      // do nothing
                    } else {
                      $update_report .= 'Code bytes are not the same<br>';
                      $update_report .= 'dbcodebytes = '.$dbcodebytes[1].' '.$dbcodebytes[2].' '.
                        $dbcodebytes[3].' '.$dbcodebytes[4].' <br>';
                      $update_report .= 'codebytes = '.$codebytes[1].' '.$codebytes[2].' '.
                        $codebytes[3].' '.$codebytes[4].' <br>';
                      // must change the codebytes in the database
                      
                    }
                  } else {  // the full filepath is not in
                    // check if codebytes are already in_array and filenames are the same
                    $isIn = false;
                    for ($j = 1; $j <= $c; $j++) {
                      if (codebytes_same($dbcbarr[$j],$codebytes)) {
                        if (filenames_same($farr[$j],$ss)) {
                          // assume the file was moved so treat as the same
                          // do nothing
                          $update_report .= 'Code bytes are the same and file names are the same<br>';
                          
                          $isIn = true;
                          break;
                        }
                      }
                    }
                    if (!$isIn) {  // new file so add to database with a new password
                      $newcount++;
                      $rpw = mt_rand(100000000,999999999);
                      $hash = create_hash($rpw);
                      $update_report .= 'New file as follows:<br>';
                      $update_report .= '$rpw = '.$rpw.'<br>';
                      $update_report .= '$hash = '.$hash.'<br>';
                      
                      $sql = "INSERT INTO finfo2 VALUES ('', ?, ?, ?, ?, ?, ?)";
                      $stmt = $mc->stmt_init();   
                      $stmt = $mc->prepare($sql);
                      if (!check($stmt, $mc)) goto be;
                      $stmt->bind_param('siiiis', $ss,$codebytes[1],$codebytes[2],$codebytes[3],$codebytes[4],$hash);
                      if (!check($stmt, $mc)) goto be;
                      $stmt->execute();
                      if (!check($stmt, $mc)) goto be;
                      // send an email to the file owner with the password
                      $update_report .= 'Sending email to the file owner<br>';
                    }
                  }
                }
              }
            }
          }
        }
      }
      $i++;
    }
  // $result['point'] .= ' '.'6';
  
    //$mc->close();
    
    $result['theFiles'] = $ss;
    $result['newcount'] = $newcount;
    $result['update_report'] = $update_report . mup_buttons(['Exit'],'update_finfo');;
    break;
    
  // *****************************************************  
  case 'getfileslist':
    require_once 'checkDB.php';
    
  // Connect to the database
  $mc =  connectToDB();
  if ($mc->connect_errno) {
    die('Connect Error (' . $mc->connect_errno . ') ' . $mc->connect_error);
  }
    
      $sql="SELECT fid, fpath FROM finfo2";
      
      //ORDER BY bname ASC";
      $stmt = $mc->stmt_init();   // this is optional but good practice, next must be prepare
      if($stmt->prepare($sql) === false) {
        trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $mc->errno . ' ' . $mc->error, E_USER_ERROR);
      }
      //$stmt->bind_param("i", $cat_id);
      $stmt->bind_result($fid,$fpath);
      $stmt->execute();
      
      $sss = "<div id='imgbox'>";
      $sss .= "<h2 style='text-align:center'>" . 'list' . "</h2>";
      $lastmargin = 0;
      $nextmargin = 1;
  $n = 0;
  $odd = false;
  
      while ($stmt->fetch()) {
        $n++;
        $s = ($odd)? 'odd':'even';
        $want = $lastmargin;
        if ($nextmargin > $want) $want = $nextmargin;
        $ss = $want-$lastmargin-$nextmargin;
        $lastmargin = $nextmargin;
        $sss .=  "<div class='listcell " . $s ."' style='margin-top:" . $ss ."px;'>";
/*         if ($pcim != '') $pcim = UPLOADPATH . $pcim;
        $ss = '2'.SEP.$bname. SEP. $bdes. SEP. $bcontact. SEP. $pcim. SEP. date('M d, Y',$dt)
          . SEP. $bcname. SEP. $bcemail. SEP. $bctel;
        $sss .=  "<div id='di_" . $id . "' data-ss='" . $ss . "'>";
 */        $sss .=  "<table class='outer' id='r".$fid. "'>";
        $sss .=  "<tr>\n";
        $sss .=  "<td  class=''>\n";
        $sss .=  "<table class='inner1'>\n";
        $sss .=  "<tr>\n";
        $sss .=  "<tr><td class='toprow'>".$fpath. "</td></tr>\n";
/*         $sss .=  "<tr><td class='botrow'>".$bdes. "</td></tr>\n";
        $sss .=  "<tr><td  class='botrow'>".$bcontact."</td></tr>";
 */        $sss .=  "</table>";
        $sss .=  "</td>\n";
        $sss .=  "<td style='width:24%;border-left:solid 1px;padding:0px;'>\n";
        $sss .=  "<div style='padding:8px;'>\n";
        //$sss .=  "$ca[$cat_id]\n";
        $sss .=  "</div>\n";
        $sss .=  "<div id='bott1'>\n";
         $sss .=  "<table style='border:0px;'>\n";
/*          $sss .=  "<tr>";
         $sss .=  "<td>".date('M d, Y',$dt). "</td>";
         $sss .=  "<td><input type='checkbox' class='cb_cls2' id='pid" . $id . "'></td>";
         $sss .=  "</tr>\n";
 */         $sss .=  "</table>";
        $sss .=  "</div>\n";
        $sss .=  "</td>\n";
        $sss .=  "</tr>\n";
        $sss .=  "</table>\n";
        $sss .=  "</div>";
        $sss .=  "</div>";
        $odd = !$odd;
      }
  $sss .=  "</div>";
  if ($n === 0) {
    $sss =  '<h3 style="text-align:center">There are no entries for this category</h3>';
  }
  //$stmt->close();
  //$mc->close();
    $result['fileslist'] = $sss;
    
    
  

    break;
    
  case 'xxx':
    break;
  case 'setSessionCompID':
    $result['value'] = 'fail';  // for testing
    break;
  }
  
  if (isset($stmt)) $stmt->close(); 
  if (isset($mc)) $mc->close();
  
  if (isset($_SESSION['userin'])) $result['userin'] = $_SESSION['userin'];

  echo json_encode($result);
  exit;
be:
  if (isset($stmt)) $stmt->close(); 
  if (isset($mc)) $mc->close();

  $result['value'] = 'fail';
  if (isset($errmsg)) $result['errmsg'] = $errmsg;
  
  echo json_encode($result);
  exit;
//***************************** end of un-function code *************************************

  
function codebytes_same($dbcodebytes,$codebytes) {
  if ($dbcodebytes[1] !== $codebytes[1]) return false;
  if ($dbcodebytes[2] !== $codebytes[2]) return false;
  if ($dbcodebytes[3] !== $codebytes[3]) return false;
  if ($dbcodebytes[4] !== $codebytes[4]) return false;
  return true;
}

function filenames_same($fn1,$fn2) {
  return (substr($fn1,strrpos($fn1,'/')) === substr($fn2,strrpos($fn2,'/'))) ? true : false;
}

function mup_buttons($barr,$val) {
  $s = "<br><p style='text-align:center' value='".$val."'>";
  foreach($barr as $butt) {
    $s .= "<button>".$butt."</button>";
  }
  $s .= "</p>";
  return $s;
}

function hasSubs($path,$notdirs){
  // returns 1 if a folder has sub folders otherwise returns 0
  $files = scandir($path);
  //natcasesort($files);
  if( count($files) > 2 ) { /* The first 2 files are . and .. */
    foreach( $files as $file ) {
      if($file != '.' && $file != '..') {
        if (is_dir($path.$file)) {
          if ($notdirs === '' || strpos($file,$notdirs) === false) {
            return 1;
          }
        }
      }
    }
  }
  return 0;
}

function doFolder($folder,$fi){
  global $f;
  global $pn;
  global $ps;
  global $nexti;
  $subs = [];
  $n = 0;
  getSubs($folder,$subs,$n);
  if ($n > 0) {
    $ps[$fi] = $nexti;
    for ($i = 0; $i < $n; $i++){
      $np = $nexti + $i;
      $f[$np] = $subs[$i];
      $pn[$np] = $np + 1;
      $ps[$np] = 0;
      $lasti[$i] = $np;
    }
    $nexti = $nexti + $n;
    //$lasti = $nexti - 1;
    $pn[$nexti-1] = 0;
    for ($i = 0; $i < $n; $i++){
      doFolder($folder. $subs[$i] . '/' ,$lasti[$i]);
    }
  }
}

function getSubs($folder,&$subs,&$n){
  global $notdirs;
  // $subs = [];
  // $n = 0;
  //if( file_exists($folder) ) {
    $files = scandir($folder);
    //natcasesort($files);
    if( count($files) > 2 ) { /* The first 2 files are . and .. */
      $files = array_diff($files, Array( ".", ".." )); 

      foreach( $files as $file ) {
        //if(file_exists($folder.$file) && $file != '.' && $file != '..') {
          if (is_dir($folder.$file)){
            // Get all the directories in $s
            if ($notdirs === '' || strpos($file,$notdirs) === false) {
              $subs[] = $file;
              $n++;
            }
          }
        //}
      }
    //}
  }
}

function doFolder2($folder,$fi){
  global $f;
  global $pn;
  global $ps;
  global $nexti;
  global $notdirs;
  $subs = [];
  $n = 0;
  //getSubs($folder,$subs,$n);
  $files = scandir($folder);
  //natcasesort($files);
  if( count($files) > 2 ) { /* The first 2 files are . and .. */
    $files = array_diff($files, Array( ".", ".." )); 
    foreach( $files as $file ) {
      if (is_dir($folder.$file)){
        if ($notdirs === '' || strpos($file,$notdirs) === false) {
          $subs[] = $file;
          $n++;
        }
      }
    }
  }
  
  if ($n > 0) {
    $ps[$fi] = $nexti;
    for ($i = 0; $i < $n; $i++){
      $np = $nexti + $i;
      $f[$np] = $subs[$i];
      $pn[$np] = $np + 1;
      $ps[$np] = 0;
      $lasti[$i] = $np;
    }
    $nexti = $nexti + $n;
    $pn[$nexti-1] = 0;
    for ($i = 0; $i < $n; $i++){
      doFolder2($folder. $subs[$i] . '/' ,$lasti[$i]);
    }
  }
}

function doFolder3($folder,$fi){
  // using a stack is better for performance than using recursion
  $stack1[] = $folder;
  $stack2[] = $fi;
  
  while ($stack1) {
    $folder = array_pop($stack1);
    $fi = array_pop($stack2);
  
    global $f;
    global $pn;
    global $ps;
    global $nexti;
    global $notdirs;
    $subs = [];
    $n = 0;
    $files = scandir($folder);
    //natcasesort($files);
    if( count($files) > 2 ) { /* The first 2 files are . and .. */
      $files = array_diff($files, Array( ".", ".." ));
      foreach( $files as $file ) {
        if (is_dir($folder.$file)){
          if ($notdirs === '' || strpos($file,$notdirs) === false) {
            $subs[] = $file;
            $n++;
          }
        }
      }
    }
    
    if ($n > 0) {
      // if natcasesort is here it has less to sort but I must use foreach instead of a for loop
      // because natcasesort moves the indexes as well which defeats the purpose
      natcasesort($subs);
      $ps[$fi] = $nexti;
      $i = 0;
      foreach($subs as $sub){
        $np = $nexti + $i;
        $f[$np] = $sub;
        $pn[$np] = $np + 1;
        $ps[$np] = 0;
        $stack1[] = $folder. $sub . '/';
        $stack2[] = $np;
        $i++;
      }
      $nexti = $nexti + $n;
      $pn[$nexti-1] = 0;  // reset last in chain to 0
    }
  }
}
  
  

  
?>
