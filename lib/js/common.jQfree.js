"use strict";

xx.module('common', function (apod) {
  // window.xx was created in myNamespace2.js
  var vars = xx.vars;
  var meta,menuFunctions,q;
  xx.imports.push(function () {
    meta = xx.meta;
    menuFunctions = xx.menuFunctions;
    q = xx.q;
  });
  
  vars.hcode = {};
  
  apod.extend({
    addhcode:addhcode,
    // public methods
    loadingOn:loadingOn,
    loadingOff:loadingOff,
    isLoadingOn:isLoadingOn,
    getHtmlCode: getHtmlCode,
    getHtml: getHtml,
    replacer:replacer,
    getImageSize:getImageSize,
    showMessage:showMessage,
    htmlspecialchars:htmlspecialchars,
    htmlspecialchars_decode:htmlspecialchars_decode,
    fixElementAndMask:fixElementAndMask,
    validateEmail: validateEmail,
    isEmail: isEmail,
    isValidURL: isValidURL,
    widen: widen,
    enterKeyOnInput:enterKeyOnInput,
    get_ext:get_ext,
    //doAjax:doAjax,
    //doAjaxFormData:doAjaxFormData,
    //wait2:wait2,
    Slider1:Slider1,
    rgbaColor:rgbaColor,
    random:random,
    trim:trim,
    tm_enable:tm_enable,
    callMenuFunc:callMenuFunc,
    getMob:getMob,
    setMob:setMob,
    makemenu:makemenu,
    //myPosition:myPosition,
    myStop:myStop
  });
  
xx.constants = {
  MAX_FILE_SIZE : 2000000,
  MIN_DOC_WIDTH : 800
};
   
// for showing the loading spinner
var nload = 0;
 
// needed by msgbox and yesnobox
var msgcallback = null;
// stores if msgboxmask must be turned off after a message was displayed
var turnmaskoff = true;
 
window.onload = readyFunction;
function readyFunction(){
  // alert("document is ready");
  //setcolorjs(_('wrapper'),'#0f0');
  //let x = q.getHeight(_('myExplorer'));
  // let y = q._('myExplorer');
  // let z = y.querySelector('#folders_div');
  // let a = y.querySelectorAll('div');
  //showMessage({msg:'testing'});
  // setTimeout(function(){},8000);
}

function addhcode(ob) {
  q.extend(vars['hcode'], ob);
}

function loadingOn(ob) {
  let domask,loadmsg,url;
  if (ob === undefined) {
    domask = true;
    loadmsg = 'Please wait';
    url = 'undefined';
  } else {
    domask = (ob.domask === undefined)? true: ob.domask;
    loadmsg = (ob.loadmsg === undefined || ob.loadmsg=='')? 'Please wait': ob.loadmsg;
    url = (ob.url === undefined)? 'undefined': ob.url;
  }
  nload++;
  // if (nload > 1) {
    // if (vars.isLocal || vars.debugon) alert('nload = ' + nload + ' in loadingOn');
    // return;
  // }
  //console.log("nload in loadingOn = " + nload +'  url= ' + url);
  q._('loadmsg').innerHTML = loadmsg;
  
  // let a = window.outerHeight;
  // let b = window.scrollTop;
  // let c = window.scrollY;
  // let d = document.body.scrollTop;  
  
  let loadbox = q._('loading');
  let e = q.getHeight(loadbox);
  let t = (window.outerHeight - q.getHeight(loadbox) - 100)/ 2 + document.body.scrollTop;
  let l = (window.outerWidth - q.getWidth(loadbox))/ 2 + document.body.scrollLeft;
  if (domask) {
    q._('loadingmask').classList.remove('nodisplay');
  }
  loadbox.style.left = l + 'px';
  loadbox.style.top = t + 'px';
  loadbox.classList.remove('nodisplay');
}

function loadingOff() {
  //console.log("in loadingOff nload= " + nload);
  if (nload <= 0) return;
  nload--;
  //console.log("nload in loadingOff = " + nload);
  if (nload > 0) return;
  q._('loading').classList.add('nodisplay');
  q._('loadingmask').classList.add('nodisplay');
}

function isLoadingOn(){
  return (nload > 0)? true:false; 
}

/*  
***************
** The next few functions are for getting html.
  getHtmlCode(v,ob) gets the html from the object hcode which is in the file hcode.js
  getHtml(id,ob) gets the html from html that gets imported into the document from a
  file such as common.php or template.php. I must be careful not to use the same id number
  for <div>s in index.php and the php file that gets included. Therefore using getHtmlCode
  is the newer and safer method.
They call functions replacer(s,dta) and getTemplateVars(str) to replace placeholders in
the html code with variables from the ob object.
***************
 */
 
function getHtmlCode(v,ob){   // from hcode.js
  let s = vars['hcode'][v];
  if (ob === undefined) return s;
  // ob is defined so replace placeholders with values from ob
  return replacer(s,ob)
}

function getHtml(id,ob) {
  let s = document.getElementById(id).innerHTML;
  if (ob === undefined) return s;
  // ob is defined so replace placeholders with values from ob
  return replacer(s,ob)
}
  
function replacer(s,ob){
  let tempVars = getTemplateVars(s);
  let val;
  for(let i in tempVars){
    let tempV = tempVars[i];
    let arrV = tempV.split('.');
    if (arrV.length > 1) {
      val = ob[arrV[0]];
      for (let j = 1; j < arrV.length; j++) {
        if (val === undefined) break;
        val = val[arrV[j]];
      }
    } else {
      val = ob[tempV];
    }
    if (val === undefined) val = '';
    s = s.replace('{'+tempV+'}',val);
  }
  return s;
}

// gets the variable names from templates used in templateParser
function getTemplateVars(str) {
  let tempVars = [], regEx = /{([^}]+)}/g, text;
  while(text = regEx.exec(str)) {
    tempVars.push(text[1]);
  }
  return tempVars;
}

/** 
@param imgSrc is the filepath to the image
@returns the height and width of the image in ob.w and ob.h
 */
function getImageSize(imgSrc,ob){
  if (imgSrc === '') {
    ob.w = 0;
    ob.h = 0;
    return;
  }
  var img = new Image();
  img.onload = function(){ob.w=this.width;ob.h=this.height;};
  img.src = imgSrc;
}

function validateEmail(email) { 
// validates an email
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function isEmail(email) { 
// validates an email
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
/* function wait2(n){
  loadingOn();
  setTimeout(loadingOff,n);
}
 */
/* function waitphp(n){
  doAjax('general.php','wait', {'wt':n*1000}, '');
}
 */
 
function get_ext(arg) {
// ok, gets the extension of a file obtained from an <input type="file"> tag
  var v;
  if (typeof arg === 'string') {
    v = arg;
  } else {
    v = arg.val();
  }
  var t = v.lastIndexOf('/') + 1;
  if (t <= 0) t = v.lastIndexOf('\\') + 1;
  var fsname = v.slice(t);
  return fsname.slice(fsname.lastIndexOf('.') + 1);
}


var rexHttpUrl = (function() {   // create the url regex in self executing function
   //URL pattern based on rfc1738 and rfc3986
  let rg_pctEncoded = "%[0-9a-fA-F]{2}";
  let rg_protocol = "(http|https):\\/\\/";
  let rg_userinfo = "([a-zA-Z0-9$\\-_.+!*'(),;:&=]|" + rg_pctEncoded + ")+" + "@";
  let rg_decOctet = "(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])"; // 0-255
  let rg_ipv4address = "(" + rg_decOctet + "(\\." + rg_decOctet + "){3}" + ")";
  let rg_hostname = "([a-zA-Z0-9\\-\\u00C0-\\u017F]+\\.)+([a-zA-Z]{2,})";
  let rg_port = "[0-9]+";
  let rg_hostport = "(" + rg_ipv4address + "|localhost|" + rg_hostname + ")(:" + rg_port + ")?";
  // chars sets
  // safe           = "$" | "-" | "_" | "." | "+"
  // extra          = "!" | "*" | "'" | "(" | ")" | ","
  // hsegment       = *[ alpha | digit | safe | extra | ";" | ":" | "@" | "&" | "=" | escape ]
  let rg_pchar = "a-zA-Z0-9$\\-_.+!*'(),;:@&=";
  let rg_segment = "([" + rg_pchar + "]|" + rg_pctEncoded + ")*";
  let rg_path = rg_segment + "(\\/" + rg_segment + ")*";
  let rg_query = "\\?" + "([" + rg_pchar + "/?]|" + rg_pctEncoded + ")*";
  let rg_fragment = "\\#" + "([" + rg_pchar + "/?]|" + rg_pctEncoded + ")*";
  return new RegExp( 
    "^"
    + "(" + rg_protocol + ")?"
    + "(" + rg_userinfo + ")?"
    + rg_hostport
    + "(\\/"
    + "(" + rg_path + ")?"
    + "(" + rg_query + ")?"
    + "(" + rg_fragment + ")?"
    + ")?"
    + "$"
  );
})();

function isValidURL(url) {
  if (rexHttpUrl.test(url)) {
      return true;
  } else {
      return false;
  }
}


/* function isValidURL2(url) {
  let encodedURL = encodeURIComponent(url);
  let isValid = false;

  $.ajax({
    url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + encodedURL + "%22&format=json",
    type: "get",
    async: false,
    dataType: "json",
    success: function(data) {
      isValid = data.query.results != null;
    },
    error: function(){
      alert('was error');
      isValid = false;
    }
  });
  return isValid;
}
 */

/* function myPosition(ele_id,parent_id) {
  // see myJsLib1.js for plain JavaScript
  let ob = {};
  ob.left = 0;
  ob.top = 0;
  let tmp =document.getElementById(ele_id);
  let $tmp = $(tmp);
  let topEle = document.querySelector('html');
  let n = 0;
  while (tmp.id != parent_id) {
    let obb = $tmp.position();
    ob.left += obb.left;
    ob.top += obb.top;
    $tmp = $tmp.offsetParent();
    tmp = $tmp[0];
    if (tmp === topEle) break;
    if (n++ > 10) break;  // don't allow more than 10 nesting
  }
  return ob;
}
 */
////////////////////////////////////////////////////////////////////////
function MY_EXPLORER() {}
////////////////////////////////////////////////////////////////////////

// jQuery File Tree Plugin
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = general.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// TERMS OF USE
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//

/* let selected_folder = null;
let folder_clicked = null;
//let selected_file = null;

;if(jQuery) (function($){
  $.fn.fileTree = function(o) {
    // Defaults
    if( !o ) {let o = {}};
    if( o.root == undefined ) o.root = '/';
    if( o.script == undefined ) o.script = 'general.php';
    //if( o.folderEvent == undefined ) o.folderEvent = 'click';
    if( o.expandSpeed == undefined ) o.expandSpeed= 35;
    if( o.collapseSpeed == undefined ) o.collapseSpeed= 35;
    if( o.expandEasing == undefined ) o.expandEasing = null;
    if( o.collapseEasing == undefined ) o.collapseEasing = null;
    if( o.multiFolder == undefined ) o.multiFolder = true;
    //if( o.loadMessage == undefined ) o.loadMessage = 'Loading...';
      
    this.each( function() {
      showTree(this, escape(o.root) );
    });
      
    function showTree(c, t) {
      // lastc = c;
      // lastt = t;
      //$(c).addClass('wait');
      let data = {'dir': t, 'only':'|qna|', 'notdirs':'_files'};
      doAjax(o.script,'getdircontents', data, '',function(json) {
        //$(c).removeClass('wait');
        if(json.value === 'success') {
          $(c).append(json.folders);
          let $toslide = $(c).find('ul:hidden');
          if( o.root == t ) {
            $toslide.show();
          } else {
            let n = $toslide.find('>li').length;
            if (n > 0) {
              $toslide.slideDown({ 
                duration: o.expandSpeed*(n+2/(n+1)), 
                easing: o.expandEasing 
              });
            }
          }
          bindTree(c);
          if (selected_folder != t) {
            selected_folder = t;
            //selected_file = null;
            $('#folders_div').find('li > div').removeClass('selected');
            $(c).find('> div').addClass('selected');
            $('#files_div').html(json.theFiles);
            $('#fn_input').val('');
          }
        } else {
          if (json.errmsg != undefined) {
            if (vars.debugon) alert(json.errmsg);
          } else {
            if (vars.debugon) alert('There was a problem with Ajax call');
          }
        }
      });
    }
    
    function bindTree(t) {
      //$(t).find('li').bind(o.folderEvent, function() {
      $(t).find('li').bind('click', function() {
        let $this = $(this);
        let $div = $this.find('div');
        folder_clicked = $div.attr('rel');
        if( $this.hasClass('collapsed') ) {
          // Expand
          if( !o.multiFolder ) {
            $this.parent().find('ul').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
            $this.parent().find('li.directory').removeClass('expanded').addClass('collapsed');
          }
          $this.find('ul').remove(); // cleanup
          showTree( this, folder_clicked);
          $this.removeClass('collapsed').addClass('expanded');
        } else {
          // Collapse
          let $slideup = $this.find('ul');
          let n = $slideup.find('>li').length;
          $slideup.slideUp({ duration: o.collapseSpeed*(n+2/(n+1)), easing: o.collapseEasing });
          $this.removeClass('expanded').addClass('collapsed');
          if (folder_clicked != selected_folder) {
            showfiles(this, folder_clicked);
          }
        }
        return false;
      });
    }
    
    function showfiles(c, t) {
      // lastc = c;
      // lastt = t;
      //$(c).addClass('wait');
      let data = {'dir': t, 'only':'|qna|', 'notdirs':'_files'};
      doAjax(o.script,'getdircontents',data, '',function(json) {
        //$(c).removeClass('wait');
        if(json.value === 'success') {
          selected_folder = t;
          $('#folders_div').find('li > div').removeClass('selected');
          $(c).find('> div').addClass('selected');
          $('#files_div').html(json.theFiles);
          $('#fn_input').val('');
        } else {
          if (json.errmsg != undefined) {
            if (vars.debugon) alert(json.errmsg);
          } else {
            if (vars.debugon) alert('There was a problem with Ajax call');
          }
        }
      });
    }
  }
})(jQuery);
 */

//***************
//** This function is the Ajax call which gets information held on the server, ie the qna files 
//** The calls are made to php files and all calls use the POST method
//***************

/* function doAjax(url,todo,data, loadmsg='Please wait...', fn_done=null,fn_fail=null,fn_always=null) {
  url = vars.URL_lib + 'php/' + url + '?todo=' + todo;
  //url = './php/' + url + '?todo=' + todo;  // works if php folder is in same folder as index.php
  //url = './lib/php/' + url + '?todo=' + todo;  // works if lib/php folder is in same folder as index.php
  let ob = {'url':url, 'loadmsg':loadmsg};
  loadingOn(ob);
  if (data === null) data = {'dummy':123};
  let req = $.ajax({
    'url': url,
    // 'url': 'abc.php',
    'type': 'POST',
    'data': data,
    //cache: false,
    //processData: true, // This is the default, the object sent is turned into a query string
    //contentType: false, // Set content type to false as jQuery will tell the server its a query string request
    'dataType': "json"    // type of data that is passed back
  });
  req.always(function(json, textStatus,jqXHR) {
    // json is either json if no errors or jqXHR if an error occurred
    // jqXHR is either jqXHR if no errors or an error if an error occurred
    loadingOff();
    json.url = url;
    json.todo = todo;
    json.textStatus = textStatus;
    if (textStatus === "success") {
      if (json.value) {
        // exit was via value = 'success' or value = 'fail'
        if (json.value === "success") {
          if (json.mailmsg && json.mailmsg !== '') {
            if (debugon) showMessage({msg:json.mailmsg,putleft:true});
          }
          if (json.resmsg && json.resmsg !== '') {
            let s='<h3><u>Important message</u></h3>';
            s += json.mailmsg;
            showMessage({msg:s,putleft:true});
          }
          if (fn_done && (typeof fn_done == "function")) fn_done(json);   
        } else if (json.value === "fail") {
          Object.assign(json,jqXHR);  // join jqXHR with json
          json.responseText = json.responseText.replace(/\",\"/g, '\", \"');
          if (json.mailmsg.indexOf('error') === -1) {
            showErrors(json);
          } else {
            let s = json.mailmsg.replace("error",'');
            // treat as ok if only email message could not be sent
            showMessage({msg:s});
            if (fn_done && (typeof fn_done == "function")) fn_done(json);   
          }
          if (fn_fail && (typeof fn_fail == "function")) fn_fail(json);
        } else {
          // I don't know what this can be
          alert("json = " + json + " and jqXHR = " + jqXHR);
          showErrors(json);
        }
      } else {
        alert("I don't know this error"); 
      }
    } else {  // textStatus is not "success"
      if (json.status) {
        // json is jqXHR in this block
        if (json.status != 200) {
          // an uncaught internal error occurred, eg 404 error
          json.errmsg = jqXHR;
          //json.errname = textStatus;
          //showErrors(json);
        } else {
          // uncaught errors, json.status = 200
          let s = extractBetween(json.responseText,"{qqqxxx","xxxqqq}");
          if (s === null) {
            // parsererror
            json.errmsg = jqXHR.message;
          } else {
            // fatal error, such errors are picked up in php by the shutdown_function()
            // they are logged to php's error_log file
            s = JSON.parse(s);
            //json.errmsg = jqXHR;
            json.jqXHRmessage = jqXHR.message;
            json.textStatus = textStatus;
            json.eeline = s.line;
            json.errmsg = s.message;
            json.eefile = s.file;
            json.type = s.type;
            json.errname = s.name;
            //vars.errs.push(json);
            //vars.errs.push(s);
            // s = "Type = " + s.type + " : " + s.name + "<br>Message = " + s.message + "<br>File = " + s.file + "<br> Line = " + s.line;
            // showMessage({msg:s,callback:()=>alert("fatal error")});
          }
        }
        if (fn_fail && (typeof fn_fail == "function")) fn_fail(json);
      } else {
        // I don't know what this can be
        alert("json = " + json + " and jqXHR = " + jqXHR);
      }
      showErrors(json);
    }      
    if (fn_always && (typeof fn_always == "function")) fn_always();
  });  
}

function showErrors(json) {
  if (!vars.debugon) return;
  var s='<h3><u>Error message from Ajax call</u></h3>';
  s += "json.textStatus : " + json.textStatus + "|";
  s += "json.value : " + json.value + "|";
  //if (json.status){
    s += "status : " + json.status + "|";
  //}  
  if (json.errmsg) s += "errmsg : " + json.errmsg + "|";
  if (json.errname) s += "errname : " + json.errname + "|";
  if (json.url) s += "url : " + json.url + "|";
  if (json.eemsg) s += "eemsg : " + json.eemsg + "|";
  if (json.eefile) s += "eefile : " + json.eefile + "|";
  if (json.eeline) s += "eeline : " + json.eeline + "|";
  if (json.eehost) s += "eefile : " + json.eehost + "|";
  if (json.eeerrno) s += "eeline : " + json.eeerrno + "|";
  if (json.eegtas) s += "eegtas : " + json.eegtas + "|";
  if (json.eecode) s += "eecode : " + json.eecode + "|";
  if (json.responseText) s += "responseText : " + json.responseText + "|";
  showMessage({msg:s,putleft:true,bc:'b'});
}

function doAjaxFormData(url,todo,params,data, loadmsg, fn_done,fn_fail) {
  let ob = {url:url, loadmsg:loadmsg};
  loadingOn(ob);
  url = vars.URL_lib + 'php/' + url + '?todo=' + todo + '&' + $.param(params);
  if (data === null) data = {dummy:123};
  let req = $.ajax({
    url: url,
    async: true,
    type: 'POST',
    data: data,
    cache: false,
    processData: false, // Don't process the data to make a query string
    contentType: false, // Set content type to false as jQuery will tell the server its a query string request
    dataType: "json"    // type of data that is passed back
  });
  req.always(function(json, textStatus) {
    loadingOff();
    if (json.status) {
      if (vars.debugon) {
        // alert the errors arising from the Ajax call
        alert( "Error with ajax call");
        alert( "jqXHR.responseText= " + json.responseText);
        alert('textStatus= ' + textStatus);
      }
      if (fn_fail && (typeof fn_fail == "function")) fn_fail(json);   
    } else {   // no error from Ajax call
      if (json.errmsg) {  // my error message
        alert(json.errmsg);
      }
      if (fn_done && (typeof fn_done == "function")) fn_done(json);   
    }
  });  
}
 */

////////////////////////////////////////////////////////////////////
function AUDIO_AND_VOLUME_CONTROL(){}
////////////////////////////////////////////////////////////////////

 /** * @constructor */
 function Slider1(contId,ballId,r) {
  this.sl_cont = q._(contId);
  this.sl_ball = q._(ballId);
  this.sl_r = r;
  this.sl_maxRight = q.getWidth(this.sl_cont) - q.getWidth(this.sl_ball) - 2;
}
 
Slider1.prototype = {
  
  'moveBall':function(e) {
    let lf = e.offsetX - 7;
    if (e.target === this.sl_ball) {
      lf = lf + e.target.offsetLeft;
      //lf = lf + $(e.target).position().left;
    } 
    if (lf < 0) {
      lf = 0;
    } else if (lf > this.sl_maxRight) {
      lf = this.sl_maxRight;
    }
    this.sl_ball.style.left = lf + 'px';
    this.sl_r = lf/this.sl_maxRight;
  },
  'initBall':function() {
    let lf = this.sl_r*this.sl_maxRight;
    this.sl_ball.style.left = lf + 'px';
  }
  
};

 initAud('cont','ball',0.2);
  
  function initAud(c,b,r) {
    let slider = new Slider1(c,b,r);
    slider.initBall();
    if (c === "cont") {
      q._('cont').addEventListener('click', e => {
        slider.moveBall(e);
        //setVolume();
        });
    } else {
      q._(c).addEventListener("click", e => {slider.moveBall(e);});
    }
    return slider;
  }


/////////////////////////////////////////////////////////////////////////////
 function COMMON_FUNCTIONS() {}
/////////////////////////////////////////////////////////////////////////////

// this function is now only used with msgbox, yesnobox and loading
function fixElementAndMask(ele_id, mask_id, mustdoit) {
  if (mustdoit === undefined) mustdoit=false;
  // if mustdoit is undefined (same as false) then the function will be exited early if the box is not showing
  let bx = q._(ele_id);
  if (!mustdoit) { 
    // if not must do it then only do it if it is already visible
    if (bx.classList.contains('nodisplay')) return;  // return if element is not visible
  }
  // the box must be showing so put it in the centre of the viewport
  q.moveElement(bx,0,0);    // put temporary at top left so it doesn't affect the scrollbars
  let mask = q._(mask_id);
  mask.classList.add('nodisplay');  // turn off mask
  // get size of the body so that the mask can be set
  let w = document.body.clientWidth;    // body width, jQ is safer
  let h = document.body.clientHeight;  // body height, jQ is safer
  //get top and left to position the box to center
  let t = (window.outerHeight - q.getHeight(bx) - 100)/ 2 + document.body.scrollTop;
  let l = (window.outerWidth - q.getWidth(bx))/ 2 + document.body.scrollLeft;
  t = t - 10;
  if (t < 10) t = 10;
  if (l < 10) l = 10;
  //Set height and width to $mask to fill up the whole screen
  if (!!mask) {
    // this tests if the box height is greater than the body height
    let oidh =  q.getHeight(bx);
    if (h < t + oidh + 10) h = t + oidh + 10;
    mask.style.width = w + 'px';
    mask.style.height = h + 'px';
    // show the mask
    mask.classList.remove('nodisplay');
  }
  // centre the dialog and then show it
  q.moveElement(bx, l, t);
  bx.classList.remove('nodisplay');
}

/** showMessage()
  msg (string)        : the message to show, default = ''
  putleft (boolean)   : if true then align left else align center, default = false
  bc (string)         : the background color of the box, default = '#eee'
  boxType (string)    : 0 for message with OK button, default = 0
                        1 for message with Yes No buttons
  tmo (boolean)       : if true the mask will be turned off after message, default = true
  callback (function) : the function that will be called after the box closes, default = null
 */  
function showMessage(ops) {
  if (xx.vars.inFunc) {
    xx.vars.msgArr.push(ops);
    return;
  } else if (_('msgbox').classList.contains('nodisplay') === false) {
  //} else if ($('div#msgbox').hasClass('nodisplay') === false) {
    xx.vars.msgArr.push(ops);
    return;
  }
  xx.vars.inFunc = true;
  let dfs = {   // defaults
    msg:  '',
    putleft: false,
    // putleft: true,
    bc:   '#eee',
    boxType: 0,
    tmo:  true,
    callback: null
  }
  Object.assign(dfs,ops);
  dfs.msg = dfs.msg.replace(/\|/g,'<br>');
  msgcallback = (typeof dfs.callback == 'function') ? dfs.callback : null;
  turnmaskoff = dfs.tmo;
  if (dfs.bc === 'g') {   // good, greenish
    dfs.bc = '#8f8';
  } else if (dfs.bc === 'w') {   // warning, yellowish
    dfs.bc = '#fe8';
  } else if (dfs.bc === 'b') {   // bad, reddish
    dfs.bc = '#f66';
  } else if (dfs.bc === 'h') {   // highlight, bright yellow
    dfs.bc = '#ff8';
  } else if (dfs.bc === undefined || dfs.bc === null){   
    dfs.bc = '#eee';   // neutral background color
  }
  let ele = q._('msgbox');
  ele.style.backgroundColor = dfs.bc;
  let el = ele.querySelector('.bmessage').innerHTML = dfs.msg;
  if (dfs.putleft) el.style.textAlign = 'left';
  if (dfs.boxType === 0) { // OK button
    ele.querySelector('#msgButton').classList.remove('nodisplay');
  } else if (dfs.boxType === 1) {  // Yes No buttons
    ele.querySelector('#yesnoButtons').classList.remove('nodisplay');
  } else {   // no button
  }
  // make the box to be 200px minimum
  ele.style.width = 'auto';  // I don't think this is needed, it is the default value
  let w = q.getWidth(ele);
  if (w < 200) {
    ele.style.width = '200px';
  } else if (w > 800) {
    ele.style.width = '800px';
  } 
  fixElementAndMask('msgbox','msgboxmask',true);  // turns the msgbox and its mask on
  ele.querySelector('button').focus();
  xx.vars.inFunc = false;
}

document.querySelector('#msgbox button').addEventListener('click', function ___clickButtonOnmsgbox(e){
  clickOrKeypressOnMsgbox(e,this);
});

document.querySelector('#msgbox').addEventListener('keypress', function ___keypressOnmsgbox(e){
  if ( e.which == 13 ) {
    let b = this.querySelector('button');
    clickOrKeypressOnMsgbox(e,b);
  }
});

function clickOrKeypressOnMsgbox(e,ele) {
  e.preventDefault();
  let yes = (ele.innerHTML === 'Yes');
  q._('msgbox').classList.add('nodisplay');
  q._('msgButton').classList.add('nodisplay');
  q._('yesnoButtons').classList.add('nodisplay');
  if (turnmaskoff) q._('msgboxmask').classList.add('nodisplay');
  if (msgcallback != null) {
    msgcallback(yes);
    msgcallback = null;
  }
  if (xx.vars.msgArr.length > 0) {
    let ops = xx.vars.msgArr.shift();
    showMessage(ops);
  }
}  

function htmlspecialchars(string) {
  var escapedString = string;
  for (var x = 0; x < htmlspecialchars.specialchars.length; x++) {
    // Replace all instances of the special character with its entity.
    escapedString = escapedString.replace(new RegExp(htmlspecialchars.specialchars[x][0], 'g'),
      htmlspecialchars.specialchars[x][1]
    );
  }
  return escapedString;
};

// A collection of special characters and their entities.
htmlspecialchars.specialchars = [
  [ '&', '&amp;' ],
  [ '<', '&lt;' ],
  [ '>', '&gt;' ],
  [ '"', '&quot;' ],
  [ "'", "&#039;" ]
  
];
 
function htmlspecialchars_decode(string) {
  var unescapedString = string;
  for (var x = 0; x < htmlspecialchars_decode.specialchars.length; x++) {
    // Replace all instances of the entity with the special character.
    unescapedString = unescapedString.replace(new RegExp(htmlspecialchars_decode.specialchars[x][1], 'g'),
      htmlspecialchars_decode.specialchars[x][0]
    );
  }
  return unescapedString;
}

htmlspecialchars_decode.specialchars = [
  [ "'", "&#039;" ],
  [ '"', '&quot;' ],
  [ '>', '&gt;' ],
  [ '<', '&lt;' ],
  [ '&', '&amp;' ]
]; 
 


// *******************************************
// Some useful functions
// *******************************************


function trim(str) {
// ok, trims white space from front and end of a string
  str = str.toString();
  let begin = 0;
  let end = str.length - 1;
  while (begin <= end && str.charCodeAt(begin) < 33) { ++begin; }
  while (end > begin && str.charCodeAt(end) < 33) { --end; }
  return str.substr(begin, end - begin + 1);
}
 
function spaces(n) {
// gets spaces for insertion into html code
  let s = '';
  for (let i = 0; i < n; i++) {
    s += "\u00a0";
  }
  return s;
}

function centreItem(id) {
  let item = q._(id);
  let lf = (document.body.clientWidth - q.getWidth(item)) / 2;
  let top = (document.body.clientHeight - q.getHeight(item)) / 3;
  if (top < 100) top = 100;
  item.style.left = lf + 'px';
  item.style.top = top + 'px';
}
 
// not used at present
// $el must be a jQ element
// function setcolor($el,col) {
  // if (col == undefined) col = vars['bkcol'];
  // $el.css('background-color',col);
// }

// el must be a js element
function setcolorjs(el,col) {
  if (col == undefined) col = vars['bkcol'];
  el.style.backgroundColor = col;
}
 
function random(low,high) {
  return Math.round(Math.random() * (high - low) + low);
}

function rgbaColor(v,opaque) {
  let rem1 = v % 256;
  v = Math.floor(v / 256);
  let rem2 = v % 256;
  let rem3 = Math.floor(v / 256);
  if (opaque) {
    return "rgba(" + rem1 + "," + rem2 + "," + rem3 + "," + opaque + ")"; 
  } else {
    return "rgb(" + rem1 + "," + rem2 + "," + rem3 + ")"; 
  }
}

function widen(yes) {
  if (yes === undefined) yes=true;
  if (yes) {  // remove col3 so that col2 is wider
    q._('col3').classList.add('nodisplay');
    q._('col2').style.width ='99%';
  } else {  // add col3
    q._('col3').classList.remove('nodisplay');
    q._('col2').style.width ='';
  }
}

function enterKeyOnInput(e,ele) {
  if ( e.which == 13 ) {
    e.stopPropagation(); 
    e.preventDefault();
    let els = ele.querySelectorAll('input.input_key,input.textinput');  // I don't know what is input_key
    if (e.target === els[els.length-1]){
      return true;
    } else {
      for (let i = 0; i < els.length; i++) {
        if (e.target === els[i]) {
          els[i+1].focus();
          return false;
        }
      }
    }
  }
  return false;
}

// takes on values of 0, 1, 2 etc according to which top menu and submenu item is on/active
var mob = {
  menuActive : -1,
  submenuActive : -1
}

// the next 2 functions enable/disable the top menu
function tm_disable() {
  q._('topmenumask').classList.remove('nodisplay');
}
function tm_enable() {
  q._('topmenumask').classList.add('nodisplay');
}

function maskscreen() {
  //console.log('in maskscreen');
  // this is only needed to turn a submenu off
  q._('bodymask').classList.remove('nodisplay');
  setTimeout("_('bodymask').classList.add('nodisplay')",100);
}

function getMob(){
  return mob;
}
 
function setMob(x,y){
  mob.menuActive = x;
  mob.submenuActive = y;
}


// ******************************************
// this event handler is for clicks on the top menu and sub menu items
// it calls the function attached to the menu item
// ******************************************

 // this should really be in edu.js and not common.js
delegate(_('topmenucontainer'),'click','li', function __clickOnAMenuItem(e) {
  e.stopPropagation(); // Stop stuff happening
  //e.preventDefault(); // Totally stop stuff happening
  // light up the menu item and submenu item that was clicked
  maskscreen();
  if (this.classList.contains('menu')) {
    mob.menuActive = Number(this.getAttribute('data-v'));
    mob.submenuActive = -1;
  } else {  // it is a submenu item
    let pa = this.parentNode.parentNode;
    mob.menuActive = Number(pa.getAttribute('data-v'));
    mob.submenuActive = Number(this.getAttribute('data-v'));
  }
  // call the function associated with the menu item that was clicked
  q._('tdhead').classList.add('nodisplay');
  callMenuFunc();
});

function callMenuFunc(){
  menuFunctions.callMenuFunc(mob);
}  
 
function makemenu() {
  // called from index.php; it inserts the top menu into the DOM
  let s = '<ul id="theMenu" class="links">';
  let n = 0;
  mob.tm = [];
  mob.sm = [];
  for (let i = 0; i < meta['topmenu'].length; i++) {
    if (meta['topmenu'][i].name) {
      if (meta['topmenu'][i].func) {
        mob.tm.push(meta['topmenu'][i].func);
      } else {
        mob.tm.push(funcName(meta['topmenu'][i].name,i));
      }
      if (meta['topmenu'][i].hide) {
        s += '<li class="menu nodisplay" data-v="' + i + '"';
      } else {
        s += '<li class="menu" data-v="' + i + '"';
      }
      if (meta['topmenu'][i].id) {
        s += ' id="' + meta['topmenu'][i].id + '"'; 
      }
      s += '>' + meta['topmenu'][i].name;
      if (meta['topmenu'][i]['submenu']) {  // has dropdown submenus
        s += ' \u25bc<ul class="ul_' + i + ' nodisplay">';
        for (let j = 0; j < meta['topmenu'][i]['submenu'].length; j++) {
          if (meta['topmenu'][i]['submenu'][j].func) {
            mob.sm.push(meta['topmenu'][i]['submenu'][j].func);
          } else {
            mob.sm.push(funcName(meta['topmenu'][i]['submenu'][j].name,i,j));
          }
          s += '<li class="submenu" data-v="' + n + '">' + meta['topmenu'][i]['submenu'][j].name + '</li>';
          n++;
        }
        s += '</ul>';
        s += '</li>';
      } else {    // top menu which has no dropdown submenus
        s += '</li>';
      }
    }
  }
  s += '</ul>';
  q._('mainmenu_placeholder').outerHTML = s;
  
  function funcName(s,i,j=undefined) {
    s = s.replace(/[ -\/_!@#$%^&*()=+\\]/g, '');
    if (j === undefined) {
      // topmenu name
      return 'mnu' + i + '_' + s;
    } else {
      // submenu name
      return 'mnu' + i + '_' + j + s;
    }
  }
}

function extractBetween(s,s1=null,s2=null) {
  if (s2 === null) {
    if (s1 === null) return null;
    let p1 = s.indexOf(s1);
    if (p1 === -1) return null;
    return s.substring(p1 + s1.length);
  } else if (s1 === null) {
    let p2 = s.indexOf(s2);
    if (p2 === -1) return null;
    return s.substring(0,p2);
  } else {
    let p1 = s.indexOf(s1);
    if (p1 === -1) return null;
    let p2 = s.indexOf(s2);
    if (p2 === -1) return null;
    return s.substring(p1 + s1.length,p2);
  }
}

function myStop(msg) {
  msg = "<b>Sorry but a fatal error has occurred.</b>|" + msg;
  showMessage({msg:msg,putleft:true,bc:"#f88",boxType:2,tmo:false});
}



});
