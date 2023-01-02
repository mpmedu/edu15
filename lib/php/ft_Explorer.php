<?php
  session_start();
  header("content-type:application/json");
  
  $data = json_decode(file_get_contents('php://input'), true);

  $todo = $_GET['todo'];
  $result = array('value' => 'success');

  switch( $todo) {
    
  // *****************************************************  
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
    
  // *****************************************************  
  case 'setSessionCompID':
    $result['value'] = 'fail';  // for testing
    break;
  }
  
  
  // if (isset($_SESSION['userin'])) $result['userin'] = $_SESSION['userin'];

  echo json_encode($result);
  exit;
be:

  $result['value'] = 'fail';
  if (isset($errmsg)) $result['errmsg'] = $errmsg;
  
  echo json_encode($result);
  exit;
//***************************** end of un-function code *************************************


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
