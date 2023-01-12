"use strict";

xx.module("common", function (apod) {
  // window.xx was created in myNamespace2.js
  let vars = xx.vars;
  let q = xx.q;
  let meta, menuFunctions;
  xx.imports.push(function () {
    meta = xx.meta;
    menuFunctions = xx.menuFunctions;
  });

  vars.hcode = {};

  apod.extend({
    addhcode: addhcode,
    // public methods
    loadingOn: loadingOn,
    loadingOff: loadingOff,
    isLoadingOn: isLoadingOn,
    getHtmlCode: getHtmlCode,
    getHtml: getHtml,
    replacer: replacer,
    getImageSize: getImageSize,
    showMessage: showMessage,
    htmlspecialchars: htmlspecialchars,
    htmlspecialchars_decode: htmlspecialchars_decode,
    fixElementAndMask: fixElementAndMask,
    validateEmail: validateEmail,
    isEmail: isEmail,
    isValidURL: isValidURL,
    widen: widen,
    enterKeyOnInput: enterKeyOnInput,
    get_ext: get_ext,
    //doAjaxFormData:doAjaxFormData,
    doFetch: doFetch,
    //wait2:wait2,
    Slider1: Slider1,
    rgbaColor: rgbaColor,
    random: random,
    trim: trim,
    callMenuFunc: callMenuFunc,
    getMob: getMob,
    setMob: setMob,
    makemenu: makemenu,
    //myPosition:myPosition,
    myStop: myStop,
    centreBoxAndShow: centreBoxAndShow,
    showDialog: showDialog,
    putMask: putMask,
    hideDialog: hideDialog,
    showDialog2: showDialog2,
    hideDialog2: hideDialog2,
    // centreDialog:centreDialog,
    checkHeight: checkHeight,
    checkWidth: checkWidth,
    getDimensions: getDimensions,
    transfer_needed_variables: transfer_needed_variables,
  });

  xx.constants = {
    MAX_FILE_SIZE: 2000000,
    MIN_DOC_WIDTH: 800,
  };

  // for showing the loading spinner
  let nload = 0;

  // needed by msgbox and yesnobox
  let msgcallback1 = null;
  let msgcallback2 = null;
  // stores if msgboxmask must be turned off after a message was displayed
  let turnmaskoff = true;

  let lastBw;   // only in common module now


  window.onload = readyFunction;
  function readyFunction() {
    // alert("document is ready");
  }

  function addhcode(ob) {
    q.extend(vars["hcode"], ob);
  }

  function loadingOn(ob) {
    let domask, loadmsg, url;
    if (ob === undefined) {
      domask = true;
      loadmsg = "Please wait";
      url = "undefined";
    } else {
      domask = ob.domask === undefined ? true : ob.domask;
      loadmsg = ob.loadmsg === undefined || ob.loadmsg == "" ? "Please wait" : ob.loadmsg;
      url = ob.url === undefined ? "undefined" : ob.url;
    }
    nload++;
    // console.log('in loadingOn');
    // console.log("nload = " + nload);
    // console.log("url = " + url);
    // console.log('****************');
    // if (nload > 1) {
    // if (vars.isLocal || vars.debugon) alert('nload = ' + nload + ' in loadingOn');
    // return;
    // }
    //console.log("nload in loadingOn = " + nload +'  url= ' + url);
    q._("loadmsg").innerHTML = loadmsg;
    if (domask) {
      q._("loadingmask").classList.remove("nodisplay");
    }
    centreBoxAndShow(q._("loading"));
  }

  function loadingOff(ob) {
    let url = "";
    if (ob) url = ob.url;
    // console.log('in loadingOff');
    // console.log("nload = " + nload);
    // console.log("url = " + url);
    // console.log('--------------');

    //console.log("in loadingOff nload= " + nload);
    if (nload <= 0) return;
    nload--;
    //console.log("nload in loadingOff = " + nload);
    if (nload > 0) return;
    q._("loading").classList.add("nodisplay");
    q._("loadingmask").classList.add("nodisplay");
  }

  function isLoadingOn() {
    return nload > 0 ? true : false;
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

  function getHtmlCode(v, ob) {
    // from hcode.js
    let s = vars["hcode"][v];
    if (ob === undefined) return s;
    // ob is defined so replace placeholders with values from ob
    return replacer(s, ob);
  }

  function getHtml(id, ob) {
    let s = document.getElementById(id).innerHTML;
    if (ob === undefined) return s;
    // ob is defined so replace placeholders with values from ob
    return replacer(s, ob);
  }

  function replacer(s, ob) {
    let tempVars = getTemplateVars(s);
    let val;
    for (let i in tempVars) {
      let tempV = tempVars[i];
      let arrV = tempV.split(".");
      if (arrV.length > 1) {
        val = ob[arrV[0]];
        for (let j = 1; j < arrV.length; j++) {
          if (val === undefined) break;
          val = val[arrV[j]];
        }
      } else {
        val = ob[tempV];
      }
      if (val === undefined) val = "";
      s = s.replace("{" + tempV + "}", val);
    }
    return s;
  }

  // gets the variable names from templates used in templateParser
  function getTemplateVars(str) {
    let tempVars = [],
      regEx = /{([^}]+)}/g,
      text;
    while ((text = regEx.exec(str))) {
      tempVars.push(text[1]);
    }
    return tempVars;
  }

  /** 
@param imgSrc is the filepath to the image
@returns the height and width of the image in ob.w and ob.h
 */
  function getImageSize(imgSrc, ob) {
    if (imgSrc === "") {
      ob.w = 0;
      ob.h = 0;
      return;
    }
    var img = new Image();
    img.onload = function () {
      ob.w = this.width;
      ob.h = this.height;
    };
    img.src = imgSrc;
  }

  function validateEmail(email) {
    // validates an email
    var re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function isEmail(email) {
    // validates an email
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
    if (typeof arg === "string") {
      v = arg;
    } else {
      v = arg.val();
    }
    var t = v.lastIndexOf("/") + 1;
    if (t <= 0) t = v.lastIndexOf("\\") + 1;
    var fsname = v.slice(t);
    return fsname.slice(fsname.lastIndexOf(".") + 1);
  }

  var rexHttpUrl = (function () {
    // create the url regex in self executing function
    //URL pattern based on rfc1738 and rfc3986
    let rg_pctEncoded = "%[0-9a-fA-F]{2}";
    let rg_protocol = "(http|https):\\/\\/";
    let rg_userinfo =
      "([a-zA-Z0-9$\\-_.+!*'(),;:&=]|" + rg_pctEncoded + ")+" + "@";
    let rg_decOctet = "(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])"; // 0-255
    let rg_ipv4address =
      "(" + rg_decOctet + "(\\." + rg_decOctet + "){3}" + ")";
    let rg_hostname = "([a-zA-Z0-9\\-\\u00C0-\\u017F]+\\.)+([a-zA-Z]{2,})";
    let rg_port = "[0-9]+";
    let rg_hostport =
      "(" +
      rg_ipv4address +
      "|localhost|" +
      rg_hostname +
      ")(:" +
      rg_port +
      ")?";
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
      "^" +
      "(" +
      rg_protocol +
      ")?" +
      "(" +
      rg_userinfo +
      ")?" +
      rg_hostport +
      "(\\/" +
      "(" +
      rg_path +
      ")?" +
      "(" +
      rg_query +
      ")?" +
      "(" +
      rg_fragment +
      ")?" +
      ")?" +
      "$"
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
  function MY_EXPLORER() { }
  ////////////////////////////////////////////////////////////////////////


  /*
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

  function doFetch(url, todo, params, data, loadmsg = "Please wait...", fn) {
    // let ob = { url: url, loadmsg: loadmsg };
    // common.loadingOn(ob);
    // loadingOn(ob);
    let c = "?";
    if (todo) {
      url = "lib/php/" + url + "?todo=" + todo;
      c = "&";
    }
    if (params) url = url + c + q.param(params);
    let ob = { url: url, loadmsg: loadmsg };
    loadingOn(ob);

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          //"Content-Type": "application/json; charset=UTF-8"
          "Content-Type": "application/json",
          // "Content-Type": "application/x-www-form-urlencoded"
        },
        body: JSON.stringify(data),
        // body: data
      })
        .then((res) => res.json())
        .then((json) => {


          // if (fn && typeof fn == "function") fn(json);
          //console.log(json);
          // common.loadingOff();
          loadingOff(ob);
          resolve(json);
          // resolve();
        })
        .catch((err) => {
          console.log(err);
          // common.loadingOff();
          loadingOff(ob);
          reject();
        });
    });
  }

  ////////////////////////////////////////////////////////////////////
  function AUDIO_AND_VOLUME_CONTROL() { }
  ////////////////////////////////////////////////////////////////////

  /** * @constructor */
  function Slider1(contId, ballId, r) {
    this.sl_cont = q._(contId);
    this.sl_ball = q._(ballId);
    this.sl_r = r;
    this.sl_maxRight = q.getWidth(this.sl_cont) - q.getWidth(this.sl_ball) - 2;
  }

  Slider1.prototype = {
    moveBall: function (e) {
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
      this.sl_ball.style.left = lf + "px";
      this.sl_r = lf / this.sl_maxRight;
    },
    initBall: function () {
      let lf = this.sl_r * this.sl_maxRight;
      this.sl_ball.style.left = lf + "px";
    },
  };

  initAud("cont", "ball", 0.2);

  function initAud(c, b, r) {
    let slider = new Slider1(c, b, r);
    slider.initBall();
    if (c === "cont") {
      q._("cont").addEventListener("click", (e) => {
        slider.moveBall(e);
        //setVolume();
      });
    } else {
      q._(c).addEventListener("click", (e) => {
        slider.moveBall(e);
      });
    }
    return slider;
  }

  /////////////////////////////////////////////////////////////////////////////
  function COMMON_FUNCTIONS() { }
  /////////////////////////////////////////////////////////////////////////////

  // this function is now only used with msgbox, yesnobox and loading
  function fixElementAndMask(ele_id, mask_id, mustdoit) {
    if (mustdoit === undefined) mustdoit = false;
    // if mustdoit is undefined (same as false) then the function will be exited early if the box is not showing
    let bx = q._(ele_id);
    if (!mustdoit) {
      // if not must do it then only do it if it is already visible
      if (bx.classList.contains("nodisplay")) return; // return if element is not visible
    }
    // the box must be showing so put it in the centre of the viewport
    q.moveElement(bx, 0, 0); // put temporary at top left so it doesn't affect the scrollbars
    let mask = q._(mask_id);
    mask.classList.add("nodisplay"); // turn off mask
    // get size of the body so that the mask can be set
    let w = document.body.clientWidth; // body width, jQ is safer
    let h = document.body.clientHeight; // body height, jQ is safer
    //get top and left to position the box to center
    let t = (window.outerHeight - q.getHeight(bx) - 100) / 2 +
      document.body.scrollTop;
    t = t - 10;
    if (t < 10) t = 10;
    // if (l < 10) l = 10;
    //Set height and width to $mask to fill up the whole screen
    if (!!mask) {
      // this tests if the box height is greater than the body height
      let oidh = q.getHeight(bx);
      if (h < t + oidh + 10) h = t + oidh + 10;
      mask.style.width = w + "px";
      mask.style.height = h + "px";
      // show the mask
      mask.classList.remove("nodisplay");
    }
    // centre the dialog and then show it
    centreBoxAndShow(bx);
    // q.moveElement(bx, l, t);
    // bx.classList.remove("nodisplay");
  }

  /** showMessage()
  msg (string)        : the message to show, default = '', 
  putleft (boolean)   : if true then align left else align center, default = false, 
  bc (string)         : the background color of the box, default = '#eee', 
  boxType (string)    : 0 for message with OK button, default = 0, 
                        1 for message with Yes No buttons, 
  tmo (boolean)       : if true the mask will be turned off after message, default = true, 
  callback1 (function) : the function that will be called after the box closes if OK or Yes was chosen, default = null, 
  callback2 (function) : the function that will be called after the box closes if No was chosen, default = null
 */
  function showMessage(ops) {
    if (xx.vars.inFunc) {
      xx.vars.msgArr.push(ops);
      return;
    } else if (q._("msgbox").classList.contains("nodisplay") === false) {
      xx.vars.msgArr.push(ops);
      return;
    }
    xx.vars.inFunc = true;
    let dfs = {
      // defaults
      msg: "",
      putleft: false,
      // putleft: true,
      bc: "#eee",
      boxType: 0,
      tmo: true,
      callback1: null,  // for OK or Yes buttons
      callback2: null   // for No button
    };
    Object.assign(dfs, ops);
    dfs.msg = dfs.msg.replace(/\|/g, "<br>");
    msgcallback1 = typeof dfs.callback1 == "function" ? dfs.callback1 : null;
    msgcallback2 = typeof dfs.callback2 == "function" ? dfs.callback2 : null;
    turnmaskoff = dfs.tmo;
    if (dfs.bc === "g") {
      // good, greenish
      dfs.bc = "#8f8";
    } else if (dfs.bc === "w") {
      // warning, yellowish
      // dfs.bc = "#fe8";
      dfs.bc = "#f94";
    } else if (dfs.bc === "b") {
      // bad, reddish
      dfs.bc = "#f66";
    } else if (dfs.bc === "h") {
      // highlight, bright yellow
      dfs.bc = "#ff8";
    } else if (dfs.bc === undefined || dfs.bc === null) {
      dfs.bc = "#eee"; // neutral background color
    }
    let ele = q._("msgbox");
    ele.style.backgroundColor = dfs.bc;
    let el = (ele.querySelector(".bmessage").innerHTML = dfs.msg);
    if (dfs.putleft) el.style.textAlign = "left";
    if (dfs.boxType === 0) {
      // OK button
      ele.querySelector("#msgButton").classList.remove("nodisplay");
      ele.querySelector('#msgButton button').focus();
    } else if (dfs.boxType === 1) {
      // Yes No buttons
      ele.querySelector("#yesnoButtons").classList.remove("nodisplay");
      ele.querySelector('#yesnoButtons button').focus();
    } else {
      // no button
    }
    // make the box to be 200px minimum
    ele.style.width = "auto"; // I don't think this is needed, it is the default value
    let w = q.getWidth(ele);
    if (w < 200) {
      ele.style.width = "200px";
    } else if (w > 800) {
      ele.style.width = "800px";
    }
    fixElementAndMask("msgbox", "msgboxmask", true); // turns the msgbox and its mask on
    if (dfs.boxType === 0) {
      // sets focus on OK button
      ele.querySelector('#msgButton button').focus();
    } else if (dfs.boxType === 1) {
      // sets focus on Yes button
      ele.querySelector('#yesnoButtons button').focus();
    }
    xx.vars.inFunc = false;
  }

  q.delegate('msgbox', 'click', 'button', function ___clickButtonOnmsgbox(e) {
    clickOrKeypressOnMsgbox(e, this);
  });

  q.delegate('msgbox', 'keypress', 'button', function ___clickButtonOnmsgbox(e) {
    if (e.which == 13) {
      clickOrKeypressOnMsgbox(e, this);
    }
  });

  function clickOrKeypressOnMsgbox(e, ele) {
    e.preventDefault();
    let yes = ele.innerHTML !== "No";   // can be OK or Yes button
    q._("msgbox").classList.add("nodisplay");
    q._("msgButton").classList.add("nodisplay");
    q._("yesnoButtons").classList.add("nodisplay");
    if (turnmaskoff) q._("msgboxmask").classList.add("nodisplay");
    if (msgcallback1 != null && yes) {
      msgcallback1();
      msgcallback1 = null;
    } else if (msgcallback2 != null) {
      msgcallback2();
      msgcallback2 = null;
    }
    // check if there are more messages in the queue
    if (xx.vars.msgArr.length > 0) {
      let ops = xx.vars.msgArr.shift();
      showMessage(ops);
    }
  }

  function htmlspecialchars(string) {
    var escapedString = string;
    for (var x = 0; x < htmlspecialchars.specialchars.length; x++) {
      // Replace all instances of the special character with its entity.
      escapedString = escapedString.replace(
        new RegExp(htmlspecialchars.specialchars[x][0], "g"),
        htmlspecialchars.specialchars[x][1]
      );
    }
    return escapedString;
  }

  // A collection of special characters and their entities.
  htmlspecialchars.specialchars = [
    ["&", "&amp;"],
    ["<", "&lt;"],
    [">", "&gt;"],
    ['"', "&quot;"],
    ["'", "&#039;"],
  ];

  function htmlspecialchars_decode(string) {
    var unescapedString = string;
    for (var x = 0; x < htmlspecialchars_decode.specialchars.length; x++) {
      // Replace all instances of the entity with the special character.
      unescapedString = unescapedString.replace(
        new RegExp(htmlspecialchars_decode.specialchars[x][1], "g"),
        htmlspecialchars_decode.specialchars[x][0]
      );
    }
    return unescapedString;
  }

  htmlspecialchars_decode.specialchars = [
    ["'", "&#039;"],
    ['"', "&quot;"],
    [">", "&gt;"],
    ["<", "&lt;"],
    ["&", "&amp;"],
  ];

  // *******************************************
  // Some useful functions
  // *******************************************

  function trim(str) {
    // ok, trims white space from front and end of a string
    str = str.toString();
    let begin = 0;
    let end = str.length - 1;
    while (begin <= end && str.charCodeAt(begin) < 33) {
      ++begin;
    }
    while (end > begin && str.charCodeAt(end) < 33) {
      --end;
    }
    return str.substr(begin, end - begin + 1);
  }

  function spaces(n) {
    // gets spaces for insertion into html code
    let s = "";
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
    item.style.left = lf + "px";
    item.style.top = top + "px";
  }

  function centreBoxAndShow(b) {
    // b must be a jS element
    let t =
      (window.innerHeight - q.getOffsetHeight(b)) / 2.7 + document.body.scrollTop;
    let l =
      (window.innerWidth - q.getOffsetWidth(b)) / 2 + document.body.scrollLeft;

    // if less than a certain value then make them a minimum value
    if (t < 50) t = 50;
    if (l < 10) l = 10;
    // centre the flashbox and then show it
    b.style.top = t + "px";
    b.style.left = l + "px";
    b.classList.remove("nodisplay");
  }

  // not used at present
  // el must be a js element
  function setcolorjs(el, col) {
    if (col == undefined) col = vars["bkcol"];
    el.style.backgroundColor = col;
  }

  function random(low, high) {
    return Math.round(Math.random() * (high - low) + low);
  }

  function rgbaColor(v, opaque) {
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
    if (yes === undefined) yes = true;
    if (yes) {
      // remove col3 so that col2 is wider
      q._("col3").classList.add("nodisplay");
      q._("col2").style.width = "99%";
    } else {
      // add col3
      q._("col3").classList.remove("nodisplay");
      q._("col2").style.width = "";
    }
  }

  function enterKeyOnInput(e, ele) {
    if (e.which == 13) {
      e.stopPropagation();
      e.preventDefault();
      let els = ele.querySelectorAll("input.input_key,input.textinput"); // I don't know what is input_key
      if (e.target === els[els.length - 1]) {
        return true;
      } else {
        for (let i = 0; i < els.length; i++) {
          if (e.target === els[i]) {
            els[i + 1].focus();
            return false;
          }
        }
      }
    }
    return false;
  }

  // takes on values of 0, 1, 2 etc according to which top menu and submenu item is on/active
  var mob = {
    menuActive: -1,
    submenuActive: -1,
  };

  function maskscreen() {
    //console.log('in maskscreen');
    // this is only needed to turn a submenu off
    q._("bodymask").classList.remove("nodisplay");
    setTimeout(() => {
      q._("bodymask").classList.add("nodisplay");
    }, 100);
  }

  function getMob() {
    return mob;
  }

  function setMob(x, y) {
    mob.menuActive = x;
    mob.submenuActive = y;
  }

  // ******************************************
  // this event handler is for clicks on the top menu and sub menu items
  // it calls the function attached to the menu item
  // ******************************************

  // this should really be in edu.js and not common.js
  q.delegate("topmenucontainer", "click", "#theMenu li", function __clickOnAMenuItem(e) {
    e.stopPropagation(); // Stop stuff happening
    //e.preventDefault(); // Totally stop stuff happening
    // light up the menu item and submenu item that was clicked
    maskscreen();
    if (this.classList.contains("menu")) {
      mob.menuActive = Number(this.getAttribute("data-v"));
      mob.submenuActive = -1;
    } else {
      // it is a submenu item
      let pa = this.parentNode.parentNode;
      mob.menuActive = Number(pa.getAttribute("data-v"));
      mob.submenuActive = Number(this.getAttribute("data-v"));
    }
    // call the function associated with the menu item that was clicked
    // q._("tdhead").classList.add("nodisplay");  // I don't know what tdhead is
    callMenuFunc();
  }
  );

  function callMenuFunc() {
    menuFunctions.callMenuFunc(mob);
  }

  function makemenu() {
    // called from index.php; it inserts the top menu into the DOM
    let s = '<ul id="theMenu" class="links">';
    let n = 0;
    mob.tm = [];
    mob.sm = [];
    for (let i = 0; i < meta["topmenu"].length; i++) {
      if (meta["topmenu"][i].name) {
        if (meta["topmenu"][i].func) {
          mob.tm.push(meta["topmenu"][i].func);
        } else {
          mob.tm.push(funcName(meta["topmenu"][i].name, i));
        }
        if (meta["topmenu"][i].hide) {
          s += '<li class="menu nodisplay" data-v="' + i + '"';
        } else {
          s += '<li class="menu" data-v="' + i + '"';
        }
        if (meta["topmenu"][i].id) {
          s += ' id="' + meta["topmenu"][i].id + '"';
        }
        s += ">" + meta["topmenu"][i].name;
        if (meta["topmenu"][i]["submenu"]) {
          // has dropdown submenus
          s += ' \u25bc<ul class="ul_' + i + ' nodisplay">';
          for (let j = 0; j < meta["topmenu"][i]["submenu"].length; j++) {
            if (meta["topmenu"][i]["submenu"][j].func) {
              mob.sm.push(meta["topmenu"][i]["submenu"][j].func);
            } else {
              mob.sm.push(
                funcName(meta["topmenu"][i]["submenu"][j].name, i, j)
              );
            }
            s +=
              '<li class="submenu" data-v="' +
              n +
              '">' +
              meta["topmenu"][i]["submenu"][j].name +
              "</li>";
            n++;
          }
          s += "</ul>";
          s += "</li>";
        } else {
          // top menu which has no dropdown submenus
          s += "</li>";
        }
      }
    }
    s += "</ul>";
    q._("mainmenu_placeholder").outerHTML = s;

    function funcName(s, i, j = undefined) {
      s = s.replace(/[ -\/_!@#$%^&*()=+\\]/g, "");
      if (j === undefined) {
        // topmenu name
        return "mnu" + i + "_" + s;
      } else {
        // submenu name
        return "mnu" + i + "_" + j + s;
      }
    }
  }

  function extractBetween(s, s1 = null, s2 = null) {
    if (s2 === null) {
      if (s1 === null) return null;
      let p1 = s.indexOf(s1);
      if (p1 === -1) return null;
      return s.substring(p1 + s1.length);
    } else if (s1 === null) {
      let p2 = s.indexOf(s2);
      if (p2 === -1) return null;
      return s.substring(0, p2);
    } else {
      let p1 = s.indexOf(s1);
      if (p1 === -1) return null;
      let p2 = s.indexOf(s2);
      if (p2 === -1) return null;
      return s.substring(p1 + s1.length, p2);
    }
  }

  function myStop(msg) {
    msg = "<b>Sorry but a fatal error has occurred.</b>|" + msg;
    showMessage({
      msg: msg,
      putleft: true,
      bc: "#f88",
      boxType: 2,
      tmo: false,
    });
  }

  function showDialog(id) {
    // myCheck(1, "showdialog1 \n" + getDimensions());
    centreDialog(q._(id));
    //myCheck(1, 'showdialog2 \n' + getDimensions());
    putMask("dialogmask", "wrapper");
    //myCheck(1, 'showdialog3 \n' + getDimensions());
    // tm_disable();
    // gc_disable();
    checkWidth();
  }

  function showDialog2(id) {
    centreDialog(q._(id));
    q._("dialogmask2").classList.remove("nodisplay"); // turn on dialogmask2
    checkWidth();
  }

  function putMask(mask, container) {
    // it makes the mask to be the same size as its container and then turns it on
    // const c = q._(container);
    // const m = q._(mask);
    // m.style.width = c.offsetWidth + "px";
    // m.style.height = c.offsetHeight + "px";
    // m.classList.remove("nodisplay");

    q._(mask).classList.remove("nodisplay");
  }

  function hideDialog(id) {
    q._(id).classList.add("nodisplay");
    q._("dialogmask").classList.add("nodisplay"); // turn off the dialogmask
    checkHeight();
    checkWidth();
  }

  function hideDialog2(id) {
    q._(id).classList.add("nodisplay");
    q._("dialogmask2").classList.add("nodisplay"); // turn off dialogmask2
    q._('wrapper').style.height = 'auto';
  }

  function centreDialog(dialog) {
    // myCheck(2, "centre dialog1 \n" + getDimensions());
    dialog.classList.add("nodisplay");
    // myCheck(2, "centre dialog2 \n" + getDimensions());
    checkHeight();
    checkWidth();
    checkHeight();
    // show the dialog and get its dimensions
    dialog.style.top = '-1000px';
    dialog.classList.remove("nodisplay");
    // const h = dialog.offsetHeight + 60
    const w = dialog.offsetWidth;
    // move the dialog to the center
    dialog.style.left = (document.body.clientWidth - w) / 2 + "px";
    dialog.style.top = 80 + 25 + "px";
    dialog.classList.remove("nodisplay");
    fixHeight(dialog);
  }

  function fixHeight(ele){

    // let rb =document.getElementById('resultsbox');
    const h = ele.offsetHeight;
    const w = ele.offsetWidth;
    let tp = ele.offsetTop;
    // let mh = tp + h + 20 + div3.offsetHeight;
    const wh = tp + h + 20 - 80;
    // if (mh < ddc) mh = ddc;
    // document.body.style.minHeight = document.documentElement.clientHeight + 'px';
    const wrapper = q._('wrapper');
    
    wrapper.style.height = wh + 'px';
  
  }

  function checkWidth() {
    document.querySelector("body").style.width = "auto";
    let w = document.body.offsetWidth;
    putTopdiv(w);
return;

    //if browserWidth less rhs scroll < constants.MIN_DOC_WIDTH, ie 900, then don't make narrower
    // a horizontal scrollbar will be shown
    let bw = Math.round(document.documentElement.clientWidth); // this is the display width, vertical scrollbar not included
    myCheck(3, "checkWidth1 \n" + getDimensions());
    if (bw === lastBw) return;
    if (bw < xx.constants.MIN_DOC_WIDTH) {
      bw = xx.constants.MIN_DOC_WIDTH;
    }
    // myCheck(3, "checkWidth2 \n" + getDimensions());
    if (lastBw !== bw) {
      lastBw = bw;
      document.querySelector("body").style.width = bw + "px";
      putTopdiv(bw);
    }
    //myCheck(3, 'checkWidth5 \n' + getDimensions());
  }

  function checkHeight() {
    myCheck(4, "checkHeight1 \n" + getDimensions());
    const wrap = q._("wrapper");
    // make wrapper height exactly what is needed but it might not be enough to fill the whole window
    wrap.style.height = "auto";
    myCheck(4, "checkHeight2 \n" + getDimensions());
    // the wrapper height should be such that the whole window is filled
    let wh = document.body.scrollHeight;
    wh = window.innerHeight - tbh;
    wrap.style.minHeight = wh + 'px';
    // don't allow the wrapper to be less that 250 in height
    // if (wh < 250) wh = 250;
    // if (wrap.offsetHeight < wh) {
    //   wrap.style.height = wh + "px";
    // }
    // wrap.style.minHeight = wh + 'px';
    wrap.style.height = (document.body.scrollHeight - tbh) + 'px';
    myCheck(4, "checkHeight3 \n" + getDimensions());
  }

  // function checkHeight() {
  //   myCheck(4, "checkHeight1 \n" + getDimensions());
  //   const wrap = q._("wrapper");
  //   // make wrapper height exactly what is needed but it might not be enough to fill the whole window
  //   wrap.style.height = "auto";
  //   myCheck(4, "checkHeight2 \n" + getDimensions());
  //   // the wrapper height should be such that the whole window is filled
  //   let wh = document.body.scrollHeight;
  //   wh = window.innerHeight - tbh;
  //   wrap.style.minHeight = wh + 'px';
  //   // don't allow the wrapper to be less that 250 in height
  //   // if (wh < 250) wh = 250;
  //   // if (wrap.offsetHeight < wh) {
  //   //   wrap.style.height = wh + "px";
  //   // }
  //   // wrap.style.minHeight = wh + 'px';
  //   wrap.style.height = (document.body.scrollHeight - tbh) + 'px';
  //   myCheck(4, "checkHeight3 \n" + getDimensions());
  // }

  let checkOn = true;
  function myCheck(n, s) {
    // this uses confirm instead of alert, if you choose cancel then checkOn is set to false so subsequent
    // calls to myCheck() will not show the message box, but the value of checkOn is set back to true after
    // two seconds so that the message box will again show after that.
    //console.log(s);
    //console.log('*****************************');
    if (vars.debugon === false) return;
    if (checks[n].al === true) {
      if (checkOn) {
        let ans = confirm(s);
        if (ans === false) {
          checkOn = false;
          setTimeout("checkOn = true", 2000);
        }
      }
    }
    if (checks[n].co === true) {
      console.log(s);
    }
  }

  ////////////////////////////////////////////////////////////////////
  function RESIZING() { }
  ////////////////////////////////////////////////////////////////////

  window.addEventListener("resize", function windowResize() {
    myCheck(0, "window resize1 \n" + getDimensions());
    let ele = q._('startupbox');
    if (!ele.classList.contains("nodisplay")) {
      var dm = q._("dialogmask");
      dm.style.width = "0px";
      dm.style.height = "0px";
      centreDialog(ele); // fixes the size of the dialog box
      let wrap = q._("wrapper");
      dm.style.width = wrap.offsetWidth + "px";
      dm.style.height = wrap.offsetHeight + "px";
      return;
    }
    dm = q._("dialogmask2");
    if (!dm.classList.contains("nodisplay")) {
      // a dialog box must be showing because the dialogmask is on
      myCheck(0, "window resize2 \n" + getDimensions());
      // dm.style.width = "0px";
      // dm.style.height = "0px";
      myCheck(0, "window resize3 \n" + getDimensions());
      // the dialogmask is used with one of the following dialog boxes, ie in the dialogsArray below
      let dialogsArray = [
        // "startupbox",
        "myExplorer",
        "unlockbox",
        "creatorloginbox",
        "getqnakeybox",
        "catlist_container",
        "getnumqs",
        "gettimeallowed",
        "getaudiovolume",
        "checklist_container",
      ];
      for (let i = 0; i < dialogsArray.length; i++) {
        let tmp = q._(dialogsArray[i]);
        if (!tmp.classList.contains("nodisplay")) {
          // common.centreDialog(tmp); // fixes the size of the dialog mask
          centreDialog(tmp); // fixes the size of the dialog box
          // make the dialog mask the same size as the wrapper
          // let bd = document.querySelector('body');
          // dm.style.width = bd.offsetWidth + "px";
          // dm.style.height = bd.offsetHeight + "px";
          // let wrap = q._("wrapper");
          // dm.style.width = wrap.offsetWidth + "px";
          // dm.style.height = wrap.offsetHeight + "px";
        }
      }
    } else {
      // the wrappermask is used with the questions and options
      let wm = q._("wrappermask");
      if (!wm.classList.contains("nodisplay")) {
        wm.style.width = "0px";
        wm.style.height = "0px";
        // common.checkWidth();
        // common.checkHeight();
        // common.checkWidth();
        checkWidth();
        checkHeight();
        checkWidth();
        let wrap = q._("wrapper");
        wm.style.width = wrap.offsetWidth + "px";
        wm.style.height = wrap.offsetHeight + "px";
      } else {
        // this is done if a dialog box is not showing and wrapper mask is not showing
        // common.checkHeight();
        // common.checkWidth();
        // common.checkHeight();
        checkHeight();
        checkWidth();
        checkHeight();
      }
    }
    // common.fixElementAndMask("msgbox", "msgboxmask");
    // common.fixElementAndMask("loading", "loadingmask");
    fixElementAndMask("msgbox", "msgboxmask");
    fixElementAndMask("loading", "loadingmask");
    let e = q._("endbox");
    if (e.classList.contains("nodisplay")) {
      return;
    } else {
      // common.centreBoxAndShow(e);
      centreBoxAndShow(e);
    }
  });

  // window.addEventListener("resize", function windowResize() {
  //   myCheck(0, "window resize1 \n" + getDimensions());
  //   let ele = q._('startupbox');
  //   if (!ele.classList.contains("nodisplay")) {
  //     var dm = q._("dialogmask");
  //     dm.style.width = "0px";
  //     dm.style.height = "0px";
  //     centreDialog(ele); // fixes the size of the dialog box
  //     let wrap = q._("wrapper");
  //     dm.style.width = wrap.offsetWidth + "px";
  //     dm.style.height = wrap.offsetHeight + "px";
  //     return;
  //   }
  //   dm = q._("dialogmask2");
  //   if (!dm.classList.contains("nodisplay")) {
  //     // a dialog box must be showing because the dialogmask is on
  //     myCheck(0, "window resize2 \n" + getDimensions());
  //     // dm.style.width = "0px";
  //     // dm.style.height = "0px";
  //     myCheck(0, "window resize3 \n" + getDimensions());
  //     // the dialogmask is used with one of the following dialog boxes, ie in the dialogsArray below
  //     let dialogsArray = [
  //       // "startupbox",
  //       "myExplorer",
  //       "unlockbox",
  //       "creatorloginbox",
  //       "getqnakeybox",
  //       "catlist_container",
  //       "getnumqs",
  //       "gettimeallowed",
  //       "getaudiovolume",
  //       "checklist_container",
  //     ];
  //     for (let i = 0; i < dialogsArray.length; i++) {
  //       let tmp = q._(dialogsArray[i]);
  //       if (!tmp.classList.contains("nodisplay")) {
  //         // common.centreDialog(tmp); // fixes the size of the dialog mask
  //         centreDialog(tmp); // fixes the size of the dialog box
  //         // make the dialog mask the same size as the wrapper
  //         // let bd = document.querySelector('body');
  //         // dm.style.width = bd.offsetWidth + "px";
  //         // dm.style.height = bd.offsetHeight + "px";
  //         // let wrap = q._("wrapper");
  //         // dm.style.width = wrap.offsetWidth + "px";
  //         // dm.style.height = wrap.offsetHeight + "px";
  //       }
  //     }
  //   } else {
  //     // the wrappermask is used with the questions and options
  //     let wm = q._("wrappermask");
  //     if (!wm.classList.contains("nodisplay")) {
  //       wm.style.width = "0px";
  //       wm.style.height = "0px";
  //       // common.checkWidth();
  //       // common.checkHeight();
  //       // common.checkWidth();
  //       checkWidth();
  //       checkHeight();
  //       checkWidth();
  //       let wrap = q._("wrapper");
  //       wm.style.width = wrap.offsetWidth + "px";
  //       wm.style.height = wrap.offsetHeight + "px";
  //     } else {
  //       // this is done if a dialog box is not showing and wrapper mask is not showing
  //       // common.checkHeight();
  //       // common.checkWidth();
  //       // common.checkHeight();
  //       checkHeight();
  //       checkWidth();
  //       checkHeight();
  //     }
  //   }
  //   // common.fixElementAndMask("msgbox", "msgboxmask");
  //   // common.fixElementAndMask("loading", "loadingmask");
  //   fixElementAndMask("msgbox", "msgboxmask");
  //   fixElementAndMask("loading", "loadingmask");
  //   let e = q._("endbox");
  //   if (e.classList.contains("nodisplay")) {
  //     return;
  //   } else {
  //     // common.centreBoxAndShow(e);
  //     centreBoxAndShow(e);
  //   }
  // });





  //////////////////////////////////////////////////////////////////////
  function CHECKS() { }
  //////////////////////////////////////////////////////////////////////

  let checks = [
    {
      name: "Dimensions in resize", // 0
      al: false,
      co: false,
    },
    {
      name: "Dimensions in showDialog", // 1
      al: false,
      co: false,
    },
    {
      name: "Dimensions in showDialog2", // 1
      al: false,
      co: false,
    },
    {
      name: "Dimensions in centreDialog", // 2
      al: false,
      co: false,
    },
    {
      name: "Dimensions in checkWidth", // 3
      al: false,
      co: false,
    },
    {
      name: "Dimensions in checkHeight", // 4
      al: false,
      co: false,
    },
    {
      name: "Scroll in getDimensions", // 5
      al: false,
      co: false,
    },
    {
      name: "Keycode value", // 6
      al: false,
      co: false,
    },
  ];

  // boolean which is true if category selection boxes have been clicked

  function showChecklist() {
    let ob = {};
    if (getchecklist(ob)) {
      document.getElementById("checklist_container").innerHTML = ob.s;
      // common.showDialog("checklist_container");
      showDialog2("checklist_container");
    } else {
      alert("Problem with checklist");
    }
  }

  function getchecklist(ob) {
    let bk = new Array();
    bk[0] = "#eee";
    bk[1] = "#fff";
    // first the heading
    let s =
      '<div id="checklistDialog" style="background-color:' +
      bk[checks.length % 2] +
      '">';
    s += '<div style="background-color:#666; color:white;">';
    s += '<div class="check_name" >Check</div>';
    s += '<div  class="al_cb" style="padding-left:0;">Alert</div>';
    s += '<div  class="co_cb" style="padding-left:0;">Console</div></div>';
    // now all the checks
    for (let i = 0; i < checks.length; i++) {
      s += '<div class="check_row" style="background-color:' + bk[i % 2] + '">';
      s += '<div class="check_name" >' + i + ") " + checks[i].name + "</div>";
      let alval = "";
      if (checks[i]["al"] === true) {
        alval = " checked";
      }
      s += '<div class="al_cb">';
      s += "<input type='checkbox'" + alval + ">";
      s += "</div>";
      let coval = "";
      if (checks[i]["co"] === true) {
        coval = " checked";
      }
      s += '<div class="co_cb">';
      s += "<input type='checkbox'" + coval + ">";
      s += "</div>";
      s += "</div>";
    }
    s += "<br>";
    // finally put the OK button at the bottom
    s += '<div style="margin-right:3%">';
    s += '<button class="butt_class1" style="padding:2px 10px;">OK</button>';
    s += "</div>";
    ob.s = s;
    return true;
  }

  //****************************************
  // event handler when clicking OK in the checklist dialog
  //****************************************

  q.delegate("checklist_container", "click", "button", function (e) {
    // clicking on the OK button the checklist dialog
    // common.hideDialog("checklist_container");
    hideDialog2("checklist_container");
    // update the checks array
    // first use jQ to get the input values
    let clal = q.qa("#checklist_container .al_cb>input");
    let clco = q.qa("#checklist_container .co_cb>input");
    // now write the new values to the checks array
    for (let i = 0; i < checks.length; i++) {
      checks[i].al = clal[i].checked;
      checks[i].co = clco[i].checked;
    }
  });


  //***************
  //** This function is for testing - I used it a lot when resizing the window to see how things look
  //** It will only get called if debugon is true
  //***************
  function getDimensions() {
    let s = "";
    let wrap = document.getElementById("wrapper");
    let c4 = wrap.clientHeight;
    let c2 = wrap.offsetHeight;
    let c3 = wrap.scrollHeight;
    let c5 = wrap.clientWidth;
    let c6 = wrap.offsetWidth;
    let c7 = wrap.scrollWidth;

    //---------------------------
    // height
    // window

    // js
    let e2 = window.innerHeight;
    let y6 = window.outerHeight;

    // js
    let b1 = document.body.clientHeight;
    let d3 = document.body.offsetHeight;
    let d4 = document.body.scrollHeight;
    //-------------------------------------------
    // width
    // window
    // js
    let w6 = window.innerWidth;
    let w7 = window.outerWidth;

    // document.body
    //js
    let b11 = document.body.clientWidth;
    let b12 = document.body.offsetWidth;
    let b13 = document.body.scrollWidth;


    // js values only
    s +=
      "window.outerWidth = " +
      w7 +
      " || " +
      "window.outerHeight = " +
      y6 +
      "\n";
    s +=
      "window.innerWidth = " +
      w6 +
      " || " +
      "window.innerHeight = " +
      e2 +
      "\n";

    return s;

    if (b1 > w2) {
      // there is a rhs scroll
      myCheck(5, "rhs scroll");
    }
    if (b11 > w5) {
      // there is a lhs scroll
      myCheck(5, "bottom scroll");
      if (b1 > w2) {
      }
    }

    if (w6 > x4) {
      myCheck(5, "rhs scroll using window dimensions");
    }

    if (e2 > x2) {
      myCheck(5, "bottom scroll using window dimensions");
    }

    let z3 = document.body.getBoundingClientRect();
    //let z4 = window.getBoundingClientRect();
    let z5 = wrap.getBoundingClientRect();

    //document.body.style.overflowX = "hidden";
    let z0 = document.body.style.overflow;
    let z1 = document.body.style.overflowX;
    let z2 = document.body.style.overflowY;
  }

  // These are variables and functions that have been transferred from edu
  // They belong in edu but are called from common.
  let tbh;
  let putTopdiv = function () { };

  function transfer_needed_variables(ob) {
    tbh = ob.tbh;
    // lastBw = ob.lastBw;
    putTopdiv = ob.putTopdiv;
  }

});
