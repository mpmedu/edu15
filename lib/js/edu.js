"use strict";

xx.module('edu', function (apod) {
  let vars = xx.vars;

  let common, meta, myExpl;
  xx.imports.push(function () {
    common = xx.common;
    meta = xx.meta;
    myExpl = xx.myExpl;
  });

const exports = {
  checkopenfile:checkopenfile,
  OpenFile: OpenFile,
  Categories: Categories,
  Numberofquestions: Numberofquestions,
  Timeallowed: Timeallowed,
  Audiovolume: Audiovolume
}

  apod.extend(exports);


  //////////////////////////////////////////
  function VARIABLES() { }
  //////////////////////////////////////////

  // see init() for how debugon is set, ie true for localhost otherwise it remains false

  let canDebug = false;


  // let relPath;   // relative path of application
  // let docPath;

  let lastBw = 0;  // saving the last width of body

  // let constants = {
  // MIN_DOC_WIDTH : 900
  // };

  // saves widths of menu items so that they can be properly placed when window is resized
  let topSiteNamew;
  let topPageNamew;
  let topscorew;
  let topmenuw;
  let topgobuttonw;

  let tbh;     // topdiv + bottomdiv height

  let tickpos;

  let sd;  // audio slider at bottom right for all sounds
  let sd1; // audio slider for correct/wrong sounds
  let sd2; // audio slider for background sounds
  let sd3; // audio slider for question/options sounds
  // let correct_beep = document.getElementById('correct_clip');
  // let wrong_beep = document.getElementById('wrong_clip');
  const correct_beep = _('correct_clip');
  const wrong_beep = _('wrong_clip');

  //////////////////////////////////////////
  function GENERAL() { }
  //////////////////////////////////////////

  window.onload = readyFunction;
  function readyFunction(){
    // alert("document is ready");
    xx.fixImports();   // this must always be first
    common.makemenu();

    init();

    console.log('at 1');

    fixCompid();

    console.log('at 2');

    // init();

    console.log('at 3');

    // showDialog('startupbox');}),3000);  // for testing loading div
    showDialog('startupbox');
    document.querySelector('body').removeChild(_('startupDiv'));

  }
  


  ////////////////////////////////////////////////////////////////////
  function INITIALIZE() { }
  ////////////////////////////////////////////////////////////////////

  function fixCompid() {
    if (typeof (localStorage) === "undefined") {
      // localStorage is not supported, so use cookies
      common.doAjax('general.php', 'setCompID', {}, '', function (json) {
        if (json.value === 'success') {
          xx.vars.compid = json.compID;
        } else {
          if (json.errmsg != undefined) {
            if (vars.debugon) alert(json.errmsg);
          } else {
            if (vars.debugon) alert('There was a problem with Ajax call');
          }
        }
      });
    } else {
      // localStorage is supported
      var compid = localStorage.getItem("compID");
      if (compid) {
        compid = parseInt(compid, 10);
      } else {
        compid = common.random(68000000, 675999000);
        localStorage.setItem("compID", compid);
      }
      xx.vars.compid = compid;
      common.doAjax('general.php', 'setSessionCompID', { 'compID': xx.vars.compid }, '', function (json) {
        if (json.value !== 'success') {
          if (json.errmsg != undefined) {
            if (vars.debugon) alert(json.errmsg);
          } else {
            if (vars.debugon) alert('There was a problem with Ajax call');
          }
        }
      });
    }
  }

  function init() {
    initMyExplorer();
    initTopVariables();
    initAudio();
    // get the tick position for options numbers
    tickpos = Math.round((Math.round($('#opt_num7').outerHeight()) - 12) / 2);
    $('#opt_get_height').removeClass('opt_class').addClass('nodisplay');
    // get information to display on the Home page
    getInfo();
    tm_enable();
  }

  function initMyExplorer() {
    xx.myExpl.showTheFolders();
  }

  function initTopVariables() {
    // $('#siteName').text(meta.siteVars.siteName);
    // $('#pageName').text(meta.siteVars.pageName);

    const siteName = _('siteName');
    const pageName = _('pageName');
    siteName.textContent = meta.siteVars.siteName;
    pageName.textContent = meta.siteVars.pageName;

    // _('siteName').textContent = meta.siteVars.siteName;
    // _('pageName').textContent = meta.siteVars.pageName;

    // init size of body mask
    // $('#bodymask').css({ 'width': screen.width, 'height': screen.height });

    const el = _('bodymask');
    el.style.width = screen.width;
    el.style.height = screen.height;


    // inits variables topmenuw, topPageNamew and topSiteNamew
    let $topdiv = $('#topdiv');
    topSiteNamew = $topdiv.find('#siteName').outerWidth();
    topPageNamew = $topdiv.find('#pageName').outerWidth();


    // width of top menu items and the filename box
    topscorew = $('#scorecontainer').outerWidth();
    let $theMenu = $topdiv.find('#theMenu');
    topmenuw = $theMenu.outerWidth();
    $('#topmenumask').outerWidth(topmenuw).outerHeight($theMenu.outerHeight());
    $('#toprightmenumask').outerWidth(topmenuw - $($theMenu[0].firstChild).outerWidth()).outerHeight($theMenu.outerHeight());
    let $gobutt = $('#gobutton');
    // width of game button and clock
    topgobuttonw = $gobutt.outerWidth();
    $('#gamecontainermask').outerWidth(topgobuttonw).outerHeight($gobutt.outerHeight());
    // height of topdiv + bottomdiv
    tbh = $topdiv.outerHeight() + $('#bottomdiv').outerHeight();
    // also init the top of the wrappermask and dialogmask to be the top of the wrapper
    $('#wrappermask').css('top', $topdiv.outerHeight());
    $('#dialogmask').css('top', $topdiv.outerHeight());
  }

  function initAudio() {
    sd = initAud('cont', 'ball', 0.2);   // make overall starting volume be 20%
    sd1 = initAud('cont_v1', 'ball_v1', default_volumes.r1);
    sd2 = initAud('cont_v2', 'ball_v2', default_volumes.r2);
    sd3 = initAud('cont_v3', 'ball_v3', default_volumes.r3);

    function initAud(c, b, r) {
      let slider = new common.Slider1(c, b, r);
      slider.initBall();
      if (c === "cont") {
        $("#cont").on("click", e => { slider.moveBall(e); setVolume(); });
      } else {
        $("#" + c).on("click", e => { slider.moveBall(e); });
      }
      return slider;
    }
  }

  function getInfo() {
    // called from init() and clicking on gobutton
    // it gets the information that is shown at startup and before a new game
    $('#wrapper').css('background-image', 'none');
    document.getElementById('wrapper').innerHTML = common.getHtml("tem_info");
    checkHeight();
    checkWidth();
  }

  $('#wrapper').on('click', '.info_class', function clickOnInfoClassInWrapper(e) {
    // this is executed when you click on any item of info which is displayed in the wrapper
    $(this).next().next().toggleClass('nodisplay');
    checkHeight();
    checkWidth();
  });


  ////////////////////////////////////////////////////////////////////
  function RESIZING() { }
  ////////////////////////////////////////////////////////////////////

  $(window).on('resize', function windowResize() {
    myCheck(0, 'window resize1 \n' + getDimensions());
    let $dm = $('#dialogmask');
    if (!$dm.hasClass('nodisplay')) {
      // a dialog box must be showing because the dialogmask is on
      myCheck(0, 'window resize2 \n' + getDimensions());
      $dm.width(0).height(0);
      myCheck(0, 'window resize3 \n' + getDimensions());
      // the dialogmask is used with one of the following dialog boxes, ie in the dialogsArray below
      let dialogsArray = ['startupbox', 'myExplorer', 'unlockbox', 'creatorloginbox', 'getqnakeybox',
        'catlist_container', 'getnumqs', 'gettimeallowed', 'getaudiovolume', 'checklist_container'];
      for (let i = 0; i < dialogsArray.length; i++) {
        let $tmp = $('#' + dialogsArray[i]);
        if (!$tmp.hasClass('nodisplay')) {
          centreDialog($tmp);    // fixes the size of the dialog mask
          // make the dialog mask the same size as the wrapper
          let $w = $('#wrapper');
          $dm.width($w.outerWidth());
          $dm.height($w.outerHeight());
          //return;
        }
      }
    } else {
      // the wrappermask is used with the questions and options
      let $wm = $('#wrappermask');
      if (!$wm.hasClass('nodisplay')) {
        $wm.width(0).height(0);
        checkWidth();
        checkHeight();
        checkWidth();
        let $w = $('#wrapper');
        $wm.width($w.outerWidth());
        $wm.height($w.outerHeight());
        //return;
      } else {
        // this is done if a dialog box is not showing and wrapper mask is not showing
        checkHeight();
        checkWidth();
        checkHeight();
      }
    }
    // fixElementAndMask('yesnobox','msgboxmask');
    common.fixElementAndMask('msgbox', 'msgboxmask');
    common.fixElementAndMask('loading', 'loadingmask');
    let $e = $('#endbox');
    if ($e.hasClass('nodisplay')) {
      return;
    } else {
      $e.removeClass('nodisplay');
      centreBoxAndShow($e);
    }
  });


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
          setTimeout('checkOn = true', 2000);
        }
      }
    }
    if (checks[n].co === true) {
      console.log(s);
    }
  }


  function showDialog(id) {
    myCheck(1, 'showdialog1 \n' + getDimensions());
    let $dialog = $('#' + id);
    centreDialog($dialog);
    //myCheck(1, 'showdialog2 \n' + getDimensions());
    putMask('#dialogmask', '#wrapper');
    //myCheck(1, 'showdialog3 \n' + getDimensions());
    tm_disable();
    gc_disable();
  }

  function putMask(mask, container) {
    // it makes the mask to be the same size as its container and then turns it on
    let $c = $(container);
    let $tmp = $(mask);
    $tmp.width($c.outerWidth());
    $tmp.height($c.outerHeight());
    $tmp.removeClass('nodisplay');
  }

  function hideDialog(id) {
    $('#' + id).addClass('nodisplay');
    tm_enable();  // enable the top menu
    if (fname1) gc_enable();  // if a file is open then enable the Go button
    $('#dialogmask').addClass('nodisplay');   // turn off the dialogmask
    checkHeight();
    checkWidth();
  }

  function centreDialog($dialog) {
    myCheck(2, 'centre dialog1 \n' + getDimensions());
    $dialog.addClass('nodisplay');
    myCheck(2, 'centre dialog2 \n' + getDimensions());
    checkHeight();
    checkWidth();
    checkHeight();
    // show the dialog and get its dimensions
    $dialog.removeClass('nodisplay');
    let h = $dialog.outerHeight() + 60,
      w = $dialog.outerWidth();
    //myCheck(2, 'centre dialog3 \n' + getDimensions());
    // check if the wrapper height must be increased because of the dialog height
    let $wrap = $('#wrapper');
    if ($wrap.outerHeight() < h) {
      myCheck(2, 'increase $wrap.outerHeight');
      // a vertical scrollbar will be needed so the width must be checked
      $wrap.outerHeight(h);
      checkWidth();
    }
    // move the dialog to the center
    $dialog.css('left', (document.body.clientWidth - w) / 2);
    $dialog.css('top', 80 + 30);

    //$('#loadingmask').css({'width': document.body.clientWidth, 'height': document.body.clientHeight});
    //myCheck(2, 'centre dialog4 \n' + getDimensions());
  }

  function checkWidth() {
    //if browserWidth less rhs scroll < constants.MIN_DOC_WIDTH, ie 900, then don't make narrower
    // a horizontal scrollbar will be shown
    let bw = Math.round($(window).width());   // this is the display width, vertical scrollbar not included
    myCheck(3, 'checkWidth1 \n' + getDimensions());
    if (bw === lastBw) return;
    if (bw < xx.constants.MIN_DOC_WIDTH) {
      bw = xx.constants.MIN_DOC_WIDTH;
    }
    lastBw = bw;
    $('body').width(bw);
    myCheck(3, 'checkWidth2 \n' + getDimensions());
    putTopdiv(bw);
    //myCheck(3, 'checkWidth5 \n' + getDimensions());
  };

  function checkHeight() {
    myCheck(4, 'checkHeight1 \n' + getDimensions());
    let $wrap = $('#wrapper');
    // make wrapper height exactly what is needed but it might not be enough to fill the whole window
    $wrap.css('height', 'auto');
    myCheck(4, 'checkHeight2 \n' + getDimensions());
    // the wrapper height should be such that the whole window is filled
    let wh = $(window).height() - tbh;
    // don't allow the wrapper to be less that 250 in height
    if (wh < 250) wh = 250;
    if ($wrap.outerHeight() < wh) {
      $wrap.outerHeight(wh);
    }
    myCheck(4, 'checkHeight3 \n' + getDimensions());
  }


  ////////////////////////////////////////////////////////////////////
  function TOP_DIV() { }
  ////////////////////////////////////////////////////////////////////

  function putTopdiv(bw) {
    //---------- This puts the elements in the Top Div ------------
    // put siteName, ie TestU
    let v = Math.round(0.05 * bw);
    $('#topdiv #siteName').css('left', v - 2);
    // put subject or pageName
    v = v + topSiteNamew;
    $('#topdiv p#pageName').css('left', v);
    v = v + topPageNamew;
    let v1 = 0.92 * (bw - topmenuw - topgobuttonw);
    let v2 = (v + v1 - topscorew) / 2 - 4;
    if (v2 > v1 - topscorew - 5) {
      v2 = v1 - topscorew - 5;
      $('#pageName').width(v2 - (v - topPageNamew) - 10);
    } else {
      $('#pageName').css({ 'width': 'auto' });
    }
    $('#scorecontainer').css('left', v2);
    $('#topmenucontainer').css('left', v1);
    $('#gamecontainer').css('left', v1 + topmenuw + 0.025 * bw);
  }

  // the next 2 functions enable/disable the top menu
  function tm_disable() {
    $('#topmenumask').removeClass('nodisplay');
  }
  function tm_enable() {
    $('#topmenumask').addClass('nodisplay');
  }

  // the next 2 functions enable/disable the game button
  function gc_disable() {
    // mask covers the game button
    $('#gamecontainermask').removeClass('nodisplay');
  }
  function gc_enable() {
    // turns game button mask off
    $('#gamecontainermask').addClass('nodisplay');
  }


  ////////////////////////////////////////////////////////////////////
  function CHECKING_KEY_PRESSED() { }
  ////////////////////////////////////////////////////////////////////

  document.onkeydown = testKeyCode;

  function testKeyCode(e) {
    //if (nload > 0) return;
    if (common.isLoadingOn() > 0) return;
    let keycode;
    if (window.event) {
      keycode = window.event.keyCode;
    } else if (e) {
      keycode = e.which;
    }
    //alert('keycode=' + keycode);
    e = e || window.event;
    if (e.altKey) {
      let temp = keycode;
      if (keycode === 83) {   // Alt-S was pressed, toggles vars.debugon
        if (vars.isLocal) {
          // if (canDebug) {
          // vars.debugon = !vars.debugon;
          // }
          vars.debugon = !vars.debugon;
        } else if (vars.debugon === true) {
          vars.debugon = false;
        } else if (canDebug && vars.debugon === false) {
          vars.debugon = true;
        }
        (vars.debugon) ? $('#debug').show() : $('#debug').hide();
      } else if (keycode === 76) {  // Alt-L was pressed
        if (vars.debugon && document.getElementById('fn_output').value === '') {
          //update_finfo();
          //showfileslist();
        } else if (document.getElementById('fn_output').value !== '') {
          // a file is open so the owner can login
          if (!$('#dialogmask').hasClass('nodisplay')) return;
          if (gamestate === 'New game') showCreatorLoginBox();
        }
      } else if (keycode === 88) {  // Alt-X was pressed, for showing dimensions
        alert('testkeycode1 \n' + getDimensions());
      } else if (keycode === 90) {  // Alt-Z was pressed, for showing the checkList
        if (!$('#dialogmask').hasClass('nodisplay')) return;
        if (gamestate === 'New game') showChecklist();
      }
    }
  }

  $('#pageName').on('click', function clickOnSubject() {
    canDebug = true;
    setTimeout('canDebug = false', 5000);
  });


  /////////////////////////////////// 
  function START_UP_BOX() { }
  /////////////////////////////////// 

  $('#startupbox button').on('click', function clickOnStartupboxButton() {
    if ($(this)[0].innerHTML === 'Accept') {
      hideDialog('startupbox');
    } else {
      location.replace('https://www.google.com');
    }
  });

  ////////////////////////////////////////////////////////////////////
  function UNLOCK_BOX() { }
  ////////////////////////////////////////////////////////////////////
  // The unlockbox is shown when opening a file and the file is found to be a restricted-access file

  $('#unlockbox button').on('click', function clickOnUnlockboxButton() {
    let butt = $(this).text();
    if (butt === 'Next') {
      let inps = $('#unlockbox input');
      let ob = { cid: inps[0].value, key: inps[2].value };
      if (correctKey(ob)) {
        var doCookie = 0;
        if (typeof (localStorage) === "undefined") {
          // localStorage is not supported, use cookies
          doCookie = 1;
        } else {
          // set localStorage here, doCookie is already 0
          localStorage.setItem(fname1, xx.vars.compid);
        }
        // the correct key was entered to unlock the qna file, so set a cookie
        common.doAjax('general.php', 'setFree', { 'doCookie': doCookie }, '', function (json) {
          isRestricted = false;
          common.showMessage({
            msg: 'Correct key', bc: 'g', callback: function () {
              hideDialog('unlockbox')
            }
          });
        });
      } else {
        // wrong key
        common.showMessage({ msg: 'Wrong key', bc: 'b' });
      }
    } else {    // must be Exit
      hideDialog('unlockbox');
    }
  });

  $('body').on('keypress', '#unlockbox', function (e) {
    // this calls the click event handler above if Enter was pressed
    if (common.enterKeyOnInput(e, this)) {
      $('#unlockbox button:eq(0)').trigger('click');
    }
  });

  function correctKey(ob) {
    // first check the key that was entered
    let s2 = ob.key;
    // remove seperators from the input key
    s2 = s2.replace(/[- _./\|,:\\]/g, "");
    if (s2.length != 12) { return false };
    // now process the computer id and check it against the key that was entered
    let s1 = ob.cid;
    s1 = s1.replace(/-/g, "");
    s1 = getRegKey(s1);
    if (s1 != s2) { return false };
    // they are the same so return True, because the correct key was entered
    return true;
  }


  ////////////////////////////////////////////////////////////////////
  function CREATOR_LOGIN() { }
  ////////////////////////////////////////////////////////////////////

  let loginTries;

  function showCreatorLoginBox() {
    //if (!$('#dialogmask').hasClass('nodisplay')) return;
    if (++loginTries > 5) return;
    $('#clb1_input').val(document.getElementById('fn_output').value);  // the filename, eg science.qna
    $('#clb2_input').val('');   // textbox for the password to be entered by the owner of the file
    // show the box
    showDialog('creatorloginbox');
    // set focus on the 2nd input field, textbox of the creator's password
    document.getElementById('clb2_input').focus();
  }

  $('#creatorloginbox button').on('click', function clickOnCreatorloginboxButton(e) {
    // see what button was clicked
    let butt = $(this).text();
    if (butt === 'Next') {
      let inps = $('#creatorloginbox input');
      let ob = { fName: inps[0].value, pw: inps[1].value };
      if (pwStringCheck(ob)) {
        hideDialog('creatorloginbox');
        showGetQnaKeyBox();
      } else {
        common.showMessage({ msg: 'Wrong password' });
        if (++loginTries > 5) {
          hideDialog('creatorloginbox');
        }
      }
    } else {
      hideDialog('creatorloginbox');
    }
  });

  $('body').on('keypress', '#creatorloginbox', function (e) {
    // this calls the click event handler above if Enter was pressed
    if (common.enterKeyOnInput(e, this)) {
      $('#creatorloginbox button:eq(0)').trigger('click');
    }
  });


  function pwStringCheck(ob) {
    let ss, L;
    let preS, prePW;
    //Begin
    // if the string gotten for the file is "" then return false
    if (pwString === "") { return false };
    if (pwString.length === 0) { return false };
    // this call is common to writePWString() in editQnA and pwStringCheck() in editQnA and edu
    ss = preparePWString(ob.pw, ob.fName.toLowerCase());
    L = ss.length;
    // calculate how many letters before the start of encrypted string, ie prePW and get the string preS
    prePW = Math.trunc((100 - L) / 7);
    if (prePW < 2) { prePW = 2 };
    preS = pwString.substr(0, prePW);
    // calculate the new pwString to check against the existing one
    ss = newPWString(preS, ss, L);
    if (ss != pwString) { return false };
    // they are the same so return True
    return true;
  }

  function preparePWString(pw, fName) {
    let s = new Array();
    //Begin
    // pw must be as least 3 characters long
    let L = pw.length;
    if (L < 3) {
      s[1] = pw + "XXX".substr(0, 3 - L);
    } else {
      s[1] = pw;
    }
    // if a vna file change it to a qna file
    let p = fName.lastIndexOf(".");
    if (fName.substr(p) === ".vna") {
      s[2] = fName.substr(p) + "qna";
    } else {
      s[2] = fName;
    }
    // merge pw and fName
    return mix(s);
  }

  function newPWString(preS, s, L) {
    let i, x, d, f;
    //Begin
    let ss = preS;
    for (i = 0; i < L; i++) {
      d = ss.charCodeAt(i) - 97;  // so that d can never be 0
      if (d <= 0) return "";
      x = s.charCodeAt(i);
      while (true) {
        f = x % d;
        ss = ss + String.fromCharCode(f + 100);
        x = Math.trunc(x / d);
        if (f < 4) {
          d = f + 5;
          if (f < 2) {
            if (L > 25) break;
          } else {
            if (L > 35) break;
          }
        } else {
          d = f;
        }
        if (x === 0) break;
      }
    }
    return ss;
  }


  ////////////////////////////////////////////////////////////////////
  function GET_QNA_KEY_BOX() { }
  ////////////////////////////////////////////////////////////////////

  function showGetQnaKeyBox() {
    $('#gqkb2_input').val(document.getElementById('fn_output').value);
    $('#gqkb1_input').val('');    // textbox for the string to be input, eg 637083-BN
    $('#gqkb3_input').val('');    // textbox for the unlock key to be output, eg 2804-6317-0834
    // show the getqnakeybox
    showDialog('getqnakeybox');
    // set focus on the 1st input field, textbox for input
    document.getElementById('gqkb1_input').focus();
  }

  $('#getqnakeybox button').on('click', function clickOnGetqnakeyboxButton(e) {
    let butt = $(this).text();
    if (butt === 'Calculate key') {
      $('#gqkb3_input').val('');    // set textbox for the unlock key to ''
      let inps = $('#getqnakeybox input');
      let ob = { cid: inps[0].value };
      if (calculateKey(ob)) {
        inps[2].value = ob.s2;
      } else {
        common.showMessage({ msg: 'Bad computer ID', bc: 'b' });
      }
    } else {
      hideDialog('getqnakeybox');
    }
  });

  function calculateKey(ob) {
    // This calculates the key to unlock the qna file
    // check the key that was entered
    let s1 = ob.cid;
    let pattern = /[- _./\|,:\\]/g;
    s1 = s1.replace(pattern, "");
    if (s1.length != 8) { return false };
    s1 = s1.toUpperCase();
    s1 = getRegKey(s1);
    if (s1 == null) { return false };
    ob.s2 = s1.substr(0, 4) + "-" + s1.substr(4, 4) + "-" + s1.substr(8);
    return true;
  }

  function getRegKey(s1) {
    // returns a 12 digit string, 8 digits made from the input comp id, s1, and 4 digits from
    // codeBytes(1 and 2) from the qna file
    // make 8 digits from the compID adjusted with codeBytes(1 and 2)
    let v = parseInt(s1.substr(0, 6), 10);
    if (v < 100000) { return null };
    s1 = s1.substr(s1.length - 2);
    let n;
    for (let i = 1; i >= 0; i--) {
      v = v * 26;
      n = s1.charCodeAt(i) - 65;
      if ((n < 0) || (n > 25)) { return null };
      v = v + n;
    }
    // v is now the original comp id number with a value from 68 000 000 to 675 999 000
    // adjust v using codeBytes(1 and 2)
    let v1 = codeBytes[1];
    let v2 = codeBytes[2];
    if (v1 > v2) {
      v = Math.trunc(v / v1) * v2;
    } else {
      v = Math.trunc(v / v2) * v1;
    }
    // reduce v so that it has 8 digits
    while (v > 99999999) {   // 8 digits
      v = Math.trunc(v / 7);
    }
    let ss = new Array;
    ss[1] = String(v);
    // make 4 digits from codeBytes(1 and 2) which are from the file
    v = v1 * v2;
    while (v > 9999) {  // 4 digits
      v = Math.trunc(v / 6);
    }
    ss[2] = String(v);
    // now get one string from the 8 digit and 4 digit strings = 12 digit string
    return mix(ss);
  }

  function mix(s) {
    let ss = "";
    let L = [];
    let p, k;
    let i, j, r;
    //Begin
    L[1] = s[1].length;
    L[2] = s[2].length;
    if (L[1] > L[2]) {
      i = 1;
      j = 2;
    } else {
      j = 1;
      i = 2;
    }
    // get ratio and truncate to integer
    r = Math.trunc(L[i] / L[j]);
    // now merge/mix the 2 strings
    p = 0;
    for (k = 0; k < L[j]; k++) {
      ss = ss + s[i].substr(p, r) + s[j].substr(k, 1);
      p = p + r;
    }
    return ss + s[i].substr(p);
  }

  //////////////////////////////////////////////////////////////////////
  function OPEN_FILE() { }
  //////////////////////////////////////////////////////////////////////

  // saves the full file name and path of the opened file and the directory of the files folder
  var fname1;
  var filesDir;

  // global variables saved from the qna file which are read when the file is opened
  let subject;
  let settings;
  let numCats;
  let catArr;
  let totalQs;
  let isRestricted;
  let nFreeAccessQs;
  let base;
  let fdata;
  let ptrArr;
  let codeBytes;
  let cdArr;
  let ansCoder;
  let filesPath;
  let textColor;
  let fontName;
  let fontSize;
  let fontBold = new Array();
  let fontUnderline = new Array();
  let fontItalic = new Array();
  let FrameBorderWidth;
  let FrameBackColor;
  let FrameBorderColor;
  let RimWidth;
  let backgroundPicture;
  let backgroundStyle;
  let backgroundColor;
  let backgroundSound;
  let backgroundQTimeSound;
  let keyForecolor;
  let keyBackcolor;
  let keyBordercolor;
  let fenceTLcolor;
  let fenceBRcolor;
  let tickColor;
  let pwString;
  let dcontact;

  // **************** OpenFile() *********************
  function OpenFile() {
    showDialog('myExplorer');

    // document.getElementById('myExplorer').classList.remove('nodisplay');
  }


  function checkopenfile(butt,fname='') {
    fname1 = fname;
    // this function is called when you try to open a qna file
    getandopenfile(butt).done(function (result) {
      //alert(result);
      if (result === 'bad') {
        common.showMessage({ msg: 'Problem with opening the file', bc: 'w' });
      } else if (result === 'cancel') {
        // do nothing
      } else if (result === 'good') {
        if (backgroundColor < 0) {
          backgroundColor = 300000;
        }
        $('#wrapper').css('background-color', common.rgbaColor(backgroundColor, 0.6));
        loginTries = 0;
        if (isRestricted) {
          // this is a Restricted-access qna file so show the unlock box
          // first display the contact details
          let s = "<b>Name: " + dcontact[1] + "</b><br>";
          s += "<b>Contact: " + dcontact[2];
          if (dcontact[3] != '') { s += ", " + dcontact[3]; }
          if (dcontact[4] != '') { s += ", " + dcontact[4]; }
          if (dcontact[5] != '') { s += ", " + dcontact[5]; }
          if (dcontact[6] != '') { s += ", " + dcontact[6]; }
          s += "</b>";
          document.getElementById('contactdetails').innerHTML = s;
          // the following code puts the computer id in the 1st input field
          let x = vars.compid;
          s = String.fromCharCode(65 + x % 26);
          x = Math.trunc(x / 26);
          s = s + String.fromCharCode(65 + x % 26);
          x = Math.trunc(x / 26);
          s = x + "-" + s;
          $('#gcode_input1').val(s);
          // the filename is already in fn_output, so put it in the 2nd input field
          $('#gcode_input2').val(document.getElementById('fn_output').value);
          // clear the 3rd input field
          $('#gcode_input3').val('');
          // show the unlock box
          showDialog('unlockbox');
          // set focus on the 3rd input field
          document.getElementById('gcode_input3').focus();
        }
      }
    });
  }

  function getandopenfile(butt) {
    let dfd = $.Deferred();
    hideDialog('myExplorer');
    let fn = document.getElementById('fn_input').value;
    if (fn === '') {
      $('#toprightmenumask').removeClass('nodisplay');
      return dfd.resolve('cancel');
    }
    gc_enable();
    if (butt === "Open") {
      let root = window.location.origin + '/';
      let tmp = root + fname1.substr(0, fname1.lastIndexOf('.')) + '_files/';
      if (filesDir === tmp) return dfd.resolve('cancel');
      filesDir = tmp;
      var stored = null;
      if (typeof (localStorage) !== "undefined") {
        stored = localStorage.getItem(fname1);
      }
      var data = { 'fpath': fname1, 'stored': stored };
      common.doAjax('general.php', 'openfile', data, 'Reading the file, please wait', function (json) {
        if (json.value === 'success') {
          //alert(json.pointReached);    
          subject = json.subject;
          settings = json.settings;
          numCats = json.numCats;
          catArr = json.catArr;
          totalQs = json.totalQs
          isRestricted = json.isRestricted;

          //isRestricted = true;   // for testing
          //if (isRestricted) {
          dcontact = json.dcontact;
          codeBytes = json.codeBytes;
          //} else {
          //dcontact = null;  
          //codeBytes = null;
          //}
          nFreeAccessQs = json.nFreeAccessQs;
          base = json.base;
          fdata = json.data;
          ptrArr = json.ptrArr;
          cdArr = json.cdArr;
          ansCoder = json.ansCoder;
          filesPath = json.filesPath;
          textColor = json.textColor;
          fontName = json.fontName;
          fontSize = json.fontSize;
          fontBold[1] = (json.fontBold[1] !== 0);
          fontBold[2] = (json.fontBold[2] !== 0);
          fontUnderline[1] = (json.fontUnderline[1] !== 0);
          fontUnderline[2] = (json.fontUnderline[2] !== 0);
          fontItalic[1] = (json.fontItalic[1] !== 0);
          fontItalic[2] = (json.fontItalic[2] !== 0);
          FrameBorderWidth = json.FrameBorderWidth;
          FrameBackColor = json.FrameBackColor;
          FrameBorderColor = json.FrameBorderColor;
          RimWidth = json.RimWidth;
          backgroundPicture = json.backgroundPicture;
          if (backgroundPicture != '') {
            backgroundPicture = backgroundPicture.substr(1);
          }
          backgroundStyle = json.backgroundStyle;
          backgroundColor = json.backgroundColor;
          backgroundSound = json.backgroundSound;
          if (backgroundSound != '') {
            backgroundSound = filesDir + backgroundSound.substr(1);
            $('#back_sound').attr('src', backgroundSound);
            isBackSound = true;
          } else {
            isBackSound = false;
          }
          backgroundQTimeSound = json.backQTimeSound;
          if (backgroundQTimeSound != '') {
            backgroundQTimeSound = filesDir + backgroundQTimeSound.substr(1);
            $('#backQTime_sound').attr('src', backgroundQTimeSound);
            isBackQTimeSound = true;
          } else {
            isBackQTimeSound = false;
          }
          keyForecolor = json.keyForecolor;
          keyBackcolor = json.keyBackcolor;
          keyBordercolor = json.keyBordercolor;
          fenceTLcolor = json.fenceTLcolor;
          fenceBRcolor = json.fenceBRcolor;
          tickColor = json.tickColor;
          pwString = json.pwString;
          // set the subject for the newly opened file
          let $e = $('#pageName');
          $e.html(subject);
          topPageNamew = $e.outerWidth();
          putTopdiv($('body').width());
          document.getElementById('fn_output').value = fn;
          // get total qs
          dfd.resolve('good');
        } else {
          dfd.resolve('bad');
        }
      });
    } else if (butt === 'Cancel') {
      dfd.resolve('cancel');
    }
    return dfd.promise();
  }


  // ******************************************
  // these are the functions for dealing with clicks on buttons in the top menu.
  // they should be exactly the same as the values in $topmenu and $submenu in myFunctions.php, ie except
  // for spaces , dashes and slashes in the string which should be removed.
  // note that there are no functions for topmenu items which have submenu items
  // ******************************************

  //////////////////////////////////////////////////////////////////////
  function CATEGORIES() { }
  //////////////////////////////////////////////////////////////////////

  // dirty is a boolean which is true if category selection boxes have been clicked
  let dirty;

  function Categories() {
    let ob = {};
    if (getcatarray(ob)) {
      document.getElementById('catlist_container').innerHTML = ob.s;
      showDialog('catlist_container');
      dirty = false;
    } else {
      alert('Problem with categories in the file');
    }
  }

  function getcatarray(ob) {
    let bk = new Array();
    bk[0] = '#eee'; bk[1] = '#fff';
    // first the heading
    let s = '<div id="catlistDialog" style="background-color:' + bk[(numCats + 1) % 2] + '">';
    s += '<div style="background-color:#666; color:white;">';
    s += '<div class="cat_name">Category</div>';
    s += '<div class="numQs">Qs</div>';
    s += '<div class="selected_cb" style="padding-left:0;">Selected</div></div>';
    // now all the categories
    for (let i = 1; i <= numCats; i++) {
      s += '<div style="background-color:' + bk[i % 2] + '">';
      s += '<div class="cat_name" >' + i + ') ' + catArr[i]['name'] + '</div>';
      s += '<div  class="numQs">' + catArr[i]['n'] + '</div>';
      let cval = (catArr[i]['selected'] === true) ? 'checked' : '';
      let dval = isRestricted ? 'disabled="true" ' : '';
      s += "<div class='selected_cb'><input type='checkbox' " + dval + cval + ">" + '</div></div>';
    }
    s += '<br>';
    // finally put the buttons at the bottom
    if (!isRestricted) {
      // not restricted so allow selection of categories
      s += '<div style="margin-right:3%">';
      s += '<button id="sa1" class="butt_class1">Select all</button>';
      s += '<button id="sn1" class="butt_class1">Select none</button>';
      s += '</div>';
      s += '<div style="clear:right;margin-right:3%">';
      s += '<button id="catlist_save" class="butt_class1" style="padding:2px 10px;" >Apply</button>';
      s += '<button id="catlist_cancel" class="butt_class1" style="padding:2px 10px;">Cancel</button>';
      s += '</div>';
    } else {
      // the file is restricted so only put OK, ie don't allow selection of categories
      s += '<div style="margin-right:3%">';
      s += '<button class="butt_class1" style="padding:2px 10px;">OK</button>';
      s += '</div>';
    }
    s += '</div>';
    ob.s = s;
    return true;
  }

  //****************************************
  // event handlers in the categories list dialog
  //****************************************

  $('#catlist_container').on('click', 'button', function (e) {
    // clicking on a button the catlist dialog
    let butt = $(this).text();
    if (butt === 'Select all' || butt === 'Select none') {
      let bool = (butt === 'Select all');
      let g = $('#catlist_container input');
      for (let i = 0; i < g.length; i++) {
        g[i].checked = bool;
      }
      dirty = true;
    } else {  // clicked on the Cancel or Apply button or OK
      hideDialog('catlist_container');
      if (butt === 'Apply') {
        if (!dirty) return;
        // must first update the category array
        //let $cld = $('#catlist_container .cat_row>input');
        let $cld = $('#catlist_container input');
        let ta = new Array();
        for (let i = 0; i < $cld.length; i++) {
          ta[i] = $cld[i].checked;
        }
        if (numCats === ta.length) {
          for (let i = 0; i < numCats; i++) {
            catArr[i + 1]['selected'] = ta[i];
          }
          dirty = false;
        } else {
          alert('There was a problem with the Category list');
        }
      }
    }
  });

  $('#catlist_container').on('change', 'input', function () {
    dirty = true;
  });


  //////////////////////////////////////////////////////////////////////
  function NO_OF_QUESTIONS() { }
  //////////////////////////////////////////////////////////////////////

  // ***********************
  // variables and functions for getting the number of questions in a test
  // ***********************

  let defaultn = '20';
  let realn = defaultn;
  let orgnq;

  function Numberofquestions() {
    $('#gnq1_input').val(defaultn);
    $('#gnq2_input').val(realn);
    orgnq = realn;
    showDialog('getnumqs');
  }

  $('#getnumqs button').on('click', function (e) {
    let butt = $(this).text();
    if (butt === 'Reset') {
      realn = defaultn;
      orgnq = realn;
      $('#gnq2_input').val(realn);
    } else {
      hideDialog('getnumqs');
      if (butt === 'Apply') {
        realn = orgnq;
      }
    }
  });

  $("body").on("keyup", "#gnq2_input", function (ee) {
    let v = ee.target.value;
    if (badInput(v)) $('#gnq2_input').val(orgnq); else {
      orgnq = v;
    }
  });

  function badInput(v) {
    if (isNaN(v) || v <= 0 || v.indexOf('e') >= 0) return true;
  }


  //////////////////////////////////////////////////////////////////////
  function TIME_ALLOWED() { }
  //////////////////////////////////////////////////////////////////////

  // ***********************
  // variables and functions for getting the time allowed
  // ***********************

  let defaultta = '30';
  let realta = defaultta;
  let orgta;

  function Timeallowed() {
    // clicking on Settings -> Time allowed submenu
    $('#gta1_input').val(defaultta);
    $('#gta2_input').val(realta);
    orgta = realta;
    showDialog('gettimeallowed');
  }

  $('#gettimeallowed button').on('click', function (e) {
    let butt = $(this).text();
    if (butt == 'Reset') {
      realta = defaultta;
      orgta = realta;
      $('#gta2_input').val(realta);
    } else {
      hideDialog('gettimeallowed');
      if (butt === 'Apply') {
        realta = orgta;
      }
    }
  });

  $("body").on("keyup", "#gta2_input", function (ee) {
    let v = ee.target.value;
    if (badInput(v)) $('#gta2_input').val(orgta); else {
      orgta = v;
    }
  });


  ////////////////////////////////////////////////////////////////////
  function PLAYING_THE_GAME() { }
  ////////////////////////////////////////////////////////////////////

  // save array of questions
  let testQ;
  let totalSelected;

  let gamestate = "New game";
  let mostate = -2;

  let markup;  //saves the html for later use, ie for showq()
  let correctAnswer;   // saves correct answer for use later
  let nextcorrectAnswer;   // saves next correct answer for use later

  let timer;

  let nTest;
  let QsRound;
  let QsDone;
  let numcorrect;

  let getnextq_dfd;
  let qloaded;

  // for showing the background picture
  let cssChange;
  let pictureShowing;
  let styleShowing;
  let nextPic;
  let nextStyle;
  let nextPicPath;

  // variables used for playing sounds
  // for background sounds
  let bgSoundOn = 0;
  let backSound = document.getElementById('back_sound');
  let backQTimeSound = document.getElementById('backQTime_sound');
  let backQSound = document.getElementById('backQ_sound');
  let isBackSound = false;
  let isBackQTimeSound = false;
  let isBackQSound = false;
  // for q and options sound clips
  let clipOn = -1;
  let aon;   // for which audio clips are active, either clips0 or clips1


  $('#gobutton').on('click', function __clickOnGoButton__(e) {
    let $this = $(this);   // $this is the go button
    let color;
    if (gamestate === 'New game') {
      setVolume();
      // prepare the testQ[] array
      testQ = new Array();
      let ob = {};
      if (fillTestQ(testQ, ob)) {
        totalSelected = ob.n;
        if (totalSelected === 0) {
          common.showMessage({ msg: 'There are no questions in the selection pool', bc: 'w' });
          return;
        }
        // disable the menu
        tm_disable();
        // display the spinner while getting the first question
        common.loadingOn({ loadmsg: 'Preparing the test, please wait' });
        // save the info that was in the wrapper and then make in invisible
        document.getElementById('tem_info').innerHTML = common.getHtml("wrapper");
        $('#wrapper .info').addClass('nodisplay');
        // get the first question
        $.when(initForTest(), getnextq()).done(function (result) {
          common.loadingOff();
          if (result === 'end') {
            common.showMessage({ msg: 'There are no valid questions in the selection pool', bc: 'w' });
            tm_enable();
            return;
          }
          //console.log('first return after preparing the test');
          // set ready for a new game
          $('#thescore').css('background-color', '').html('0/0');
          $('#scorecontainer').removeClass('nodisplay');
          // fix the number of qs in the test
          nTest = realn;
          if (nTest > totalSelected) nTest = totalSelected;
          document.getElementById('score_input').value = nTest;
          checkHeight();
          checkWidth();
          // change go button to Start, green
          gamestate = 'Start';
          $this.text(gamestate);
          $this.css('background-color', '#0f0');   // green

          backSound.currentTime = 0;
          backQTimeSound.currentTime = 0;
          backQSound.currentTime = 0;
          //playBackgroundSound();
          //checkBackgroundSound();
          checkBackgroundSound();
          mostate = -1;
        });
      } else {
        alert('fault with fillTestQ');
      }
    } else if (gamestate === 'Start') {
      gamestate = 'End';
      $this.text(gamestate);
      $this.css('background-color', '#f00');    // change Go button to red
      // show the loaded question and get the next one
      showq();
      getnextq_dfd = getnextq();
    } else if (gamestate === 'End') {
      // if the endbox is showing turn it off
      $('#endbox').addClass('nodisplay');
      // clear the old game
      clearInterval(timer);
      $('#scorecontainer').addClass('nodisplay');
      document.getElementById('clock').value = '';
      //document.getElementById('wrapper').innerHTML = '';
      $('#wrappermask').addClass('nodisplay');
      tm_enable();
      getInfo();
      $('#wrapper').css('background-color', common.rgbaColor(backgroundColor, 0.6));
      // change go button to New game, grey
      gamestate = 'New game';
      $this.text(gamestate);
      $this.css('background-color', '#eee');  // grey
      // quit this game
      stopBackgroundSound();
      mostate = -2;
    }
  });

  function initForTest() {
    let $dfd = $.Deferred();
    if (backgroundPicture === '') {
      $dfd.resolve();
    } else {
      let img = new Image();
      img.onload = function () {
        $dfd.resolve();
        putBackgroundImage();
      };
      img.onerror = function () {
        $dfd.resolve();
      };
      img.src = filesDir + backgroundPicture;
    }
    QsRound = 0;
    QsDone = 0;
    numcorrect = 0;
    let css = '.q_cell_text{' + textStyles(1) + frameStyles(1) + '}';  // for q
    // for the options
    let s1 = common.rgbaColor(fenceTLcolor) + " ";
    let s2 = common.rgbaColor(fenceBRcolor) + " ";
    css += '.opt_class2:hover, .on_div{background-color:rgba(120,120,120,0.2);border-color:' + s1 + s2 + s2 + s1 + '}';
    css += '.o_cell_text{' + textStyles(2) + frameStyles(2) + '}';
    css += '.n_format2{color:' + common.rgbaColor(keyForecolor) + '; background-color:' +
      common.rgbaColor(keyBackcolor) + '; border-color:' + common.rgbaColor(keyBordercolor) + '}';
    $('style').html(css);
    // fix background color and picture and then background sound
    $('#wrapper').css('background-color', common.rgbaColor(backgroundColor));
    return $dfd.promise();
  }

  function showq() {
    mostate = 0;  // set to 'waiting for an answer'
    // change the background picture and style if necessary
    // -1 = no bg picture
    // 0 = no change
    // 1 = bg style change only
    // 2 = bg pic change only
    // 3 = change bg pic and bg style
    // 4 = put the background picture for the whole file
    if (cssChange === 0) {
      // do nothing
    } else if (cssChange === -1) {
      $('#wrapper').css('background-image', 'none');
      pictureShowing = "";
    } else if (cssChange === 2) {
      $('#wrapper').css('background-image', ' url(' + nextPicPath + ')');
      pictureShowing = nextPic;
    } else if (cssChange === 3) {
      $('#wrapper').css('background-image', ' url(' + nextPicPath + ')');
      setBackgroundStyle(nextStyle);
      pictureShowing = nextPic;
    } else if (cssChange === 4) {
      putBackgroundImage();
    } else if (cssChange === 1) {
      setBackgroundStyle(nextStyle);
    }
    // play the audio sound file
    // If there is a background sound file to this q then start it
    // else If there is a background QTime sound file then start it
    checkBackgroundSound();
    // put the question and options
    document.getElementById('wrapper').innerHTML = markup;
    aon = QsRound % 2;
    correctAnswer = nextcorrectAnswer;
    gametimer(realta);
    checkHeight();
    checkWidth();
    QsRound++;
  }

  function setBackgroundStyle(st) {
    styleShowing = st;
    if (styleShowing === 0) {
      $('#wrapper').css('background-size', '100% 100%');
    } else if (styleShowing === 1) {
      $('#wrapper').css('background-size', 'cover');
    } else if (styleShowing === 2) {
      $('#wrapper').css('background-size', 'contain');
    } else if (styleShowing === 3) {
      $('#wrapper').css('background-size', 'auto');
    }
  }

  function gametimer(timeleft) {
    if (typeof timeleft === 'undefined') timeleft = defaultta;
    if (timeleft > 3599) timeleft = 3599;
    if (timeleft === 0) timeleft = 1;
    let ob = new Object();
    ob.minutes = Math.floor(timeleft / 60);
    ob.seconds = timeleft % 60;
    ob.timeup = false;
    timeString(ob);
    timer = setInterval(function () {
      ob.seconds--;
      timeString(ob);
      if (ob.timeup) {
        clearInterval(timer);
        if (mostate === 0) {
          $('#wrapper .opt_class').removeClass('opt_class2');
          doresult('wrong', 'Time up');
        }
      }
    }, 1000);
  }

  function doresult(s, ss = 'Wrong') {
    // mostate = 1;
    mostate = -1;    // I think this is safer for now to stop stuff happening
    putMask('#wrappermask', '#wrapper');
    // put a tick next to the correct answer
    let ts = '<div style="font-size:1.3em;z-index:400;color:' + common.rgbaColor(tickColor) + ';position:absolute;top:' + tickpos + 'px;left:36px;">\u2714</div>';
    $('div#opt_num' + correctAnswer).after(ts);
    //flash a message Correct or Wrong
    if (s === 'correct') {
      playCorrectOrWrong(true);
      flashmsg('Correct, well done!', 700, 'good');
      numcorrect++;
    } else {  // s === 'wrong'
      playCorrectOrWrong(false);
      flashmsg(ss + ', number ' + correctAnswer + ' is correct', 1000, 'h');
    }
    // update the score
    $('#thescore').html(numcorrect + '/' + QsRound);
    if (QsRound >= nTest) {
      //alert('end of game')
      $('#thescore').css('background-color', 'red');
      // wait for 1000 milliseconds which gives the flashbox time to show, also 1000 ms
      setTimeout(() => showEndbox(), 1000);
    } else {
      mostate = 1;
    }
    // turn off QTime sound or QSound if playing
    pauseBackgroundSound(bgSoundOn);    // pause bg QSound or bg QTime sound
    checkBackgroundSound();   // start bg sound for whole file if there is one
  }

  function showEndbox() {
    let $eb = $('#endbox');
    let score = 'Game over...' + '<br>' + 'You scored ' + numcorrect + '/' + QsRound;
    $eb.find('p#endmsg').html(score + '<br>');
    centreBoxAndShow($eb);
  }

  function timeString(ob) {
    let s;
    if (ob.minutes === 0) {
      if (ob.seconds <= 0) ob.timeup = true;
      s = ob.seconds;
    } else {
      if (ob.seconds < 0) {
        ob.seconds = 59;
        ob.minutes--;
      }
      if (ob.minutes === 0) {
        s = ob.seconds;
      } else {
        if (ob.seconds < 10) {
          s = ob.minutes + ':0' + ob.seconds;
        } else {
          s = ob.minutes + ':' + ob.seconds;
        }
      }
    }
    document.getElementById('clock').value = s;
  }

  function putBackgroundImage() {
    pictureShowing = backgroundPicture;
    styleShowing = backgroundStyle;
    $('#wrapper').css('background-image', 'url(' + filesDir + pictureShowing + ')');
    setBackgroundStyle(styleShowing);
  }

  function getnextq() {
    var dfd = $.Deferred();
    var ok = 0;
    var bool_dfd;    // either a bool or a deferred is returned, no change so that always a deferred is returned
    var si = setInterval(function () {
      if (ok === 0) {
        qloaded = false;   // needed to start the loading spinner if a q has not yet been loaded
        ok = 1;    // this stops a reload 
        bool_dfd = loadq();
      }
      bool_dfd.done(function (result) {
        clearInterval(si);
        //qloaded = true;
        dfd.resolve(result);
        qloaded = true;
      }).fail(function () {
        // failed to load a question so put ok = 0 so that another attempt can be made on the next loop
        ok = 0;
      });
    }, 50);
    return dfd.promise();
  }

  var isClip = [[], []];
  var $ao = new Array();
  $ao[0] = $("#clips0 audio");
  $ao[1] = $("#clips1 audio");


  function loadq() {
    // this function returns false if there are no more questions in the selection pool otherwise
    // it returns a deferred
    var dfd = $.Deferred();
    var n = totalSelected - QsDone;
    if (n === 0) {
      return dfd.resolve('end');
    }
    var aonn = QsDone % 2;
    QsDone++;
    var r = common.random(1, n);
    var ob = {};
    var qx = {};
    var q = testQ[r];
    //moveFromTo n, r
    testQ[r] = testQ[n];
    getqna(q, ob, qx).done(function () {
      var nOps = ob.nOps;
      var QPB = ob.QPB;
      // get the value for cssChange, ie the change in bg pic and bg style
      cssChange = getCssChange();
      // now make the html for the next question and options
      // first the question
      var maxw = settings['Q_W'][QPB];
      var maxh = settings['Q_H'][QPB];
      var img = getImgString(maxw, maxh, qx, QPB, 0);
      var offstyle = (ob.s[6] === '') ? 'nodisplay_important' : '';
      // give the <audio> tag for the q a src if there is one
      var si = "";
      if (qx.clipPath[0] === '') {
        isClip[aonn][0] = false;
      } else {
        isClip[aonn][0] = true;
        $ao[aonn][0].src = filesDir + qx.clipPath[0].substr(1);
        si = '<img src="res/soundnew.gif">';
      }
      var obb = { 'si': si, 'offstyle': offstyle, 'q': ob.s[6], 'p0': img };
      var s = common.getHtml("tem_q", obb);
      // now for the options
      var sa = ob.sa;
      s = s + '<div class="opts" >';
      maxw = settings['A_W'][QPB];
      maxh = settings['A_H'][QPB];
      for (var i = 1; i <= nOps; i++) {
        var j = sa[i];
        img = getImgString(maxw, maxh, qx, QPB, j);
        offstyle = (ob.s[j] === '') ? 'nodisplay_important' : '';
        // give the <audio> tags for the options a src if there is one
        if (qx.clipPath[j] === '') {
          isClip[aonn][i] = false;
          si = '';
        } else {
          isClip[aonn][i] = true;
          $ao[aonn][i].src = filesDir + qx.clipPath[j].substr(1);
          si = '<img src="res/soundnew.gif">';
        }
        obb = { 'si': si, 'offstyle': offstyle, 'opt': ob.s[j], 'n': i, 'pn': img };
        var ss = common.getHtml("tem_opt", obb);
        s = s + ss;
      }
      s = s + '</div>';
      markup = s;
      // the correct answer
      nextcorrectAnswer = ob.ans;
      dfd.resolve('ok');
      //});
    }).fail(function () {
      dfd.reject('bad picture');
    });
    return dfd.promise();
  }

  function getCssChange() {
    if (nextPic === "") {    // no bg pic for the question
      if (backgroundPicture === "") {
        if (pictureShowing === "") {
          return 0;   // no change is necessary
        } else {
          return -1;   // remove the picture showing
        }
      } else {   // there is a background picture
        if (pictureShowing === "") {
          return 4;   // reput background picture
        } else {   // there is picture showing
          if (pictureShowing === backgroundPicture) {
            if (backgroundStyle === styleShowing) {
              return 0;   // no change is necessary
            } else {
              nextStyle = backgroundStyle;
              return 1;   // change the bg style to backgroundStyle
            }
          } else {
            return 4;   // reput background picture
          }
        }
      }
    } else {   // there is a bg pic for the question
      if (nextPic === pictureShowing) {
        if (nextStyle === styleShowing) {
          return 0;   // no change is necessary
        } else {
          return 1;   // change the bg style
        }
      } else {    // put the new bg pic
        if (nextStyle === styleShowing) {
          return 2;   // only put the new image
        } else {
          return 3;   // change the bg style and the image
        }
      }
    }
  }

  function textStyles(n) {
    let s1 = fontBold[n] ? 'bold ' : '';
    let s2 = fontUnderline[n] ? 'underline ' : '';
    let s3 = fontItalic[n] ? 'italic ' : '';
    let s4 = fontSize[n] + 'pt ';
    let s5 = fontName[n] === '' ? 'sans-serif' : fontName[n] + ',sans-serif';
    return "color:" + common.rgbaColor(textColor[n]) + "; font:" + s1 + s2 + s3 + s4 + s5 + ";";
  }

  function frameStyles(n) {
    if (FrameBorderWidth[n] < 0) return '';
    let s1 = FrameBorderWidth[n] + "px solid " + common.rgbaColor(FrameBorderColor[n]) + ";";
    return "padding:12px 20px;background-color:" + common.rgbaColor(FrameBackColor[n]) + "; border:" + s1;
  }

  function getImgString(maxw, maxh, qx, QPB, i) {
    // returns the html <img> string for a either a q or any option that has a picture
    let img = '';
    if (qx.picPath[i] != '') {
      let w = qx.width[i];
      let h = qx.height[i];
      if (w > 0 && h > 0) {
        if (maxw <= 0) maxw = w;
        if (maxh <= 0) maxh = h;
        // restricts w and h to maxw and maxh
        if (maxw < w || maxh < h) {
          let r2 = w / h;
          if (maxw < w && maxh < h) {
            let r1 = maxw / maxh;
            if (r1 > r2) {
              // height controls
              h = maxh;
              w = Math.round(h * r2);
            } else {
              // width controls
              w = maxw;
              h = Math.round(w / r2);
            }
          } else if (maxw < w) {
            w = maxw;
            h = Math.round(w / r2);
          } else {   // maxh < h
            h = maxh;
            w = Math.round(h * r2);
          }
        }
        // get style for border, border width and color
        let s = '';
        let bw = qx.picBorderWidth[i];
        if (bw > 0) {
          //let bc = qx.borderColor[i];
          s = 'border:solid ' + bw + 'px ' + common.rgbaColor(qx.picBorderColor[i]) + ';';
        }
        img = '<div class="qo_cell_picture"><img src="' + qx.nextPicPath[i] + '" width="' + w +
          '" height="' + h + '" alt="" style="vertical-align:middle;' + s + '"></div>';
      }
    }
    return img;
  }


  $('#wrapper').on('click', '.opt_class2', function __clickOnOption__(e) {
    // clicking on an option
    if (mostate != 0) return;
    $(this).addClass('on_div');
    clearInterval(timer);
    e.stopPropagation(); // Stop stuff happening
    e.preventDefault(); // Totally stop stuff happening
    let choice = parseInt(this.id.charAt(this.id.length - 1), 10);
    // flash Correct or Wrong
    if (choice === correctAnswer) {
      doresult('correct');
    } else {
      doresult('wrong');
    }
  });

  $('#wrappermask').on('click', function __clickOnWrappermask(e) {
    // clicking to show the next question
    e.stopPropagation(); // Stop stuff happening
    e.preventDefault(); // Totally stop stuff happening
    if (mostate != 1) return;
    $('div#flashbox').addClass('nodisplay');

    // if (qloaded === false) {
    // common.loadingOn({loadmsg:'Fetching the next question, please wait'});
    // }
    common.loadingOn({ loadmsg: 'Fetching the next question, please wait' });

    getnextq_dfd.done(function (result) {
      common.loadingOff();
      if (result === 'end') {
        common.showMessage({ msg: 'Unable to complete the test - some questions had errors', bc: 'w' });
        mostate = -1;
        $('#thescore').css('background-color', 'red');
        return;
      }
      $('#wrappermask').addClass('nodisplay');
      showq();
      if (QsRound < nTest) {
        getnextq_dfd = getnextq();
      }
    });
  });

  function flashmsg(msg1, ms, bc) {
    // flash a message, msg1, for ms micro seconds, bc = background color
    if (ms === undefined) ms = 1000;  // 1 second
    if (bc === undefined) bc = '#e55'; else {
      if (bc === 'good') bc = '#dfd'; else if (bc === 'w') bc = '#fe8'; else if (bc === 'b') bc = '#faa'; else if (bc === 'h') bc = '#ccc';
    }
    let $fb = $('#flashbox');
    $fb.find('p#flashmsg').html(msg1 + '<br><br>');
    $fb.css("background-color", bc);
    centreBoxAndShow($fb);
    //ms = 20000;
    setTimeout("$('div#flashbox').addClass('nodisplay');", ms);
  }

  function centreBoxAndShow($b) {
    let t = ($(window).height() - $b.outerHeight(true)) / 3 + $("body").scrollTop();
    if (t < 50) t = 50;
    let l = ($(window).width() - $b.outerWidth(true)) / 2 + $("body").scrollLeft();
    if (l < 10) l = 10;
    // centre the flashbox and then show it
    $b.css({ 'top': t, 'left': l });
    $b.removeClass("nodisplay");
  }

  $('#endbox button').on('click', function clickOnOKinEndbox(e) {
    $('#gobutton').trigger('click');

  });

  ////////////////////////////////////////////////////////////////////
  function STUFF_FROM_fileClass_and_general() { }
  ////////////////////////////////////////////////////////////////////

  function fillTestQ(testQ, ob) {
    // fills testQ[] array with questions in the selection pool
    let n = 0;
    if (isRestricted) {
      let j = 0;
      //while (n < inPool && n < nFreeAccessQs) {
      while (n < totalQs && n < nFreeAccessQs) {
        j++;
        for (let i = 1; i <= numCats; i++) {
          if (j <= catArr[i]['n']) testQ[++n] = catArr[i]['q'][j];
          if (n >= nFreeAccessQs) break;
        }
      }
    } else {   // isRestricted = false
      // this fills array testQ[] with all available questions
      for (let i = 1; i <= numCats; i++) {
        if (catArr[i]['selected']) {
          for (let j = 1; j <= catArr[i]['n']; j++) {
            testQ[++n] = catArr[i]['q'][j];
          }
        }
      }
    }
    ob.n = n;
    return true;
  }

  // after getting all the image sizes return resolve if ok = true or reject if ok = false
  function getqna(q, ob, qx) {
    //console.log('q in getqna = ' + q);
    let $dfd = $.Deferred();
    // get the text of the question in ob and the picPaths in qx
    readQ(q, ob, qx);
    // qx.nextPicPath[] is an array to hold the full paths to pictures
    qx.nextPicPath = new Array();
    // get image sizes of question,0, and options,1 to 5, and background,7 . This also 
    // loads the images
    let ok = true;
    let todocount = ob.nOps + 2;  // todocount is the total possible no of images
    // first load the background picture if any
    nextPic = qx.picPath[7];
    if (nextPic != '') {
      nextStyle = qx.picBorderWidth[7];
      nextPic = nextPic.substr(1);
      nextPicPath = filesDir + nextPic;
      qx.nextPicPath[7] = nextPicPath;   // needed for call to getImageSize()
      getImageSize(qx, 7).always(function () {
        // don't worry about setting ok here, it is only the background image
        if (--todocount === 0) {
          if (ok) $dfd.resolve(); else $dfd.reject();
        }
      });
    } else {
      if (--todocount === 0) {
        if (ok) $dfd.resolve(); else $dfd.reject();
      }
    }
    // now load the question picture and options pictures if any
    for (let i = 0; i <= ob.nOps; i++) {
      if (qx.picPath[i] != '') {
        qx.nextPicPath[i] = filesDir + qx.picPath[i].substr(1);
        getImageSize(qx, i).done(function () {
          if (--todocount === 0) {
            if (ok) $dfd.resolve(); else $dfd.reject();
          }
        }).fail(function () {
          ok = false;  // a bad image so set ok to false
          if (--todocount === 0) $dfd.reject();
        });
      } else {
        if (--todocount === 0) {
          if (ok) $dfd.resolve(); else $dfd.reject();
        }
      }
    }
    return $dfd.promise();
  }

  function getImageSize(qx, i) {
    // gets the dimensions of an image
    let $dfd = $.Deferred();
    let img = new Image();
    img.onload = function () {
      qx.width[i] = this.width;
      qx.height[i] = this.height;
      $dfd.resolve();
    };
    img.onerror = function () {
      $dfd.reject();
    };
    img.src = qx.nextPicPath[i];
    return $dfd.promise();
  }


  // ------------------------------------------------------
  //  The following functions are for reading a question
  // ------------------------------------------------------

  // '****************************
  // ' this reads a q into s(1 to 7) and puts picPath[] and clipPath[] into qx
  // '****************************
  function readQ(q, ob, qx) {
    // ' read in the question from the data[] array
    let arr = new Array();
    let ob2 = {};
    getQArr(q, arr, ob2);
    // ' first decode
    switchDown(arr, ob2.L);
    // ' now turn arr() into s(1 to 7) and ans etc
    let ns = new Array();
    arrToQnA(arr, ns, ob, qx);
    //console.log(qx.picBorderWidth);
    //console.log(qx.picBorderColor);
    ob.nOps = arr[1];
    ob.QPB = arr[2];
    // ' get the scramble array, ob.sa[]
    scrambleArr(ns, ob);
  }

  function getQArr(q, arr, ob2) {
    let qp = ptrArr[q];
    let off = qp['off'];
    ob2.L = qp['len'];
    // I should use slice here instead - I see that it doesn't work with objects.  I had expected
    // fdata to be an array but I see that json_encode makes it an object.
    // arr = fdata.slice(off,off+ob2.L);
    for (let i = 1; i <= ob2.L; i++) {
      arr[i] = fdata[off + i];
    }
  }

  function switchDown(arr, n) {
    // ' switchDown decodes qna file
    let start = arr[n];
    let low = cdArr['low'];
    let high = cdArr['high'];
    let sum1 = cdArr['sum1'];
    // ' this does shift down
    let b;
    for (let i = 1; i < n; i++) {  // To n - 1
      if (start > arr[i]) { b = arr[i] + 256 - start; } else { b = arr[i] - start; };
      start = b;
      // ' this does switch
      if (b > low) {
        if (b < high) {
          b = sum1 - b;
        }
      }
      arr[i] = b;
    }
  }

  // '------------------------------------------------------
  // ' These 2 functions return the Qs and As from the byte array
  // '------------------------------------------------------
  function arrToQnA(arr, ns, ob, qx) {
    //nOps = arr[1];   // don't need to return it because it is always in arr[1]
    //QPB = arr[2];    // don't need to return it because it is always in arr[2]
    let ob3 = {};
    ob3.p = 3;
    // init arrays in the qx object
    qx.picPath = new Array();
    qx.clipPath = new Array();
    qx.picBorderWidth = new Array();
    qx.picBorderColor = new Array();
    qx.width = new Array();
    qx.height = new Array();
    // init the s[] array to hold questions, options and explanation
    ob.s = new Array();
    // ' first the picPath and clipPath for the question as a whole
    qx.picPath[0] = toStr(arr, ob3, true);
    picBorderWidth_Color(arr, ob3, 0, qx);
    qx.clipPath[0] = toStr(arr, ob3, true);
    // ' now the question, ie the text
    ob.s[6] = toStr(arr, ob3, true);
    // the options
    for (let i = 1; i <= arr[1]; i++) {
      qx.picPath[i] = toStr(arr, ob3, true);
      picBorderWidth_Color(arr, ob3, i, qx);
      qx.clipPath[i] = toStr(arr, ob3, true);
      ob.s[i] = toStr(arr, ob3, false);   //  option text
      if (arr[ob3.p] === 1) { ns[i] = true; } else { ns[i] = false; };
      ob3.p = ob3.p + 1;
    }
    // ' expl picPath and clipPath and then text
    qx.picPath[6] = toStr(arr, ob3, true);
    picBorderWidth_Color(arr, ob3, 6, qx);
    qx.clipPath[6] = toStr(arr, ob3, true);
    ob.s[7] = toStr(arr, ob3, true);
    // ' get picPath[7] and clipPath[7] for the background
    qx.picPath[7] = toStr(arr, ob3, true);
    picBorderWidth_Color(arr, ob3, 7, qx);
    qx.clipPath[7] = toStr(arr, ob3, true);
    // ' ans is last byte in the array
    ob.ans = corrAns(ansCoder, ob.s[6], arr[ob3.p]);
  }

  function picBorderWidth_Color(arr, ob3, Index, qx) {
    qx.picBorderWidth[Index] = arr[ob3.p];
    if (Index != 7) {
      if (qx.picBorderWidth[Index] > 0) {
        qx.picBorderColor[Index] = arr[ob3.p + 1] + 256 * arr[ob3.p + 2] + arr[ob3.p + 3] * 65536;
      } else {
        qx.picBorderColor[Index] = 0;
      }
    }
    ob3.p = ob3.p + 4;
  }

  function corrAns(ansCoder, s, codeByte) {
    let ss;
    if (s === "") {
      ss = " ";
    } else {
      ss = s;
    }
    return Math.round(codeByte / (ss.charCodeAt(0) % ansCoder + 1));
  }

  // '****************************
  // ' this turns an array of bytes into a string
  // '****************************
  function toStr(arr, ob3, twoByte) {
    let L = arr[ob3.p];
    if (twoByte) {
      ob3.p = ob3.p + 1;
      L = L + 256 * arr[ob3.p];
    }
    let s = '';
    for (let i = 1; i <= L; i++) {
      s = s + String.fromCharCode(arr[ob3.p + i]);
    }
    ob3.p = ob3.p + L + 1;
    return s;
  }

  // '****************************
  // ' if option selected then this scrambles an array to scramble choices - always scrambled now
  // '****************************

  function scrambleArr(ns, ob) {
    // In VB5 QnA I check if the scramble option box has been checked then the scramble code is
    // executed, otherwise ob.sa[i] = i for all options.  In this function the scramble code is 
    // always executed.
    ob.sa = new Array();
    let nt = 0;
    let tmpA = new Array();
    let n = ob.nOps;
    for (let i = 1; i <= n; i++) {
      if (ns[i]) {
        ob.sa[i] = i;
      } else {
        ob.sa[i] = 0;
        nt++;
        tmpA[nt] = i;
      }
    }
    if (nt === 0) return;
    let nextOpen = 1;
    while (nt > 1) {
      while (ob.sa[nextOpen] !== 0) {
        nextOpen++;
      }
      let r = common.random(1, nt);
      ob.sa[nextOpen] = tmpA[r];
      tmpA[r] = tmpA[nt];
      nt--;
    }
    while (ob.sa[nextOpen] !== 0) {
      nextOpen++;
    }
    ob.sa[nextOpen] = tmpA[1];
    for (let i = 1; i <= n; i++) {
      if (ob.sa[i] === ob.ans) {
        ob.ans = i;
        return;
      }
    }
  }


  //////////////////////////////////////////////////////////////////////
  function CHECKS() { }
  //////////////////////////////////////////////////////////////////////

  let checks = [
    {
      name: "Dimensions in resize",    // 0
      al: false,
      co: false
    },
    {
      name: "Dimensions in showDialog",    // 1
      al: false,
      co: false
    },
    {
      name: "Dimensions in centreDialog",    // 2
      al: false,
      co: false
    },
    {
      name: "Dimensions in checkWidth",    // 3
      al: false,
      co: false
    },
    {
      name: "Dimensions in checkHeight",    // 4
      al: false,
      co: false
    },
    {
      name: "Scroll in getDimensions",    // 5
      al: false,
      co: false
    },
    {
      name: "Keycode value",      // 6
      al: false,
      co: false
    }
  ]

  // boolean which is true if category selection boxes have been clicked

  function showChecklist() {
    let ob = {};
    if (getchecklist(ob)) {
      document.getElementById('checklist_container').innerHTML = ob.s;
      showDialog('checklist_container');
    } else {
      alert('Problem with checklist');
    }
  }

  function getchecklist(ob) {
    let bk = new Array();
    bk[0] = '#eee'; bk[1] = '#fff';
    // first the heading
    let s = '<div id="checklistDialog" style="background-color:' + bk[(checks.length) % 2] + '">';
    s += '<div style="background-color:#666; color:white;">';
    s += '<div class="check_name" >Check</div>';
    s += '<div  class="al_cb" style="padding-left:0;">Alert</div>';
    s += '<div  class="co_cb" style="padding-left:0;">Console</div></div>';
    // now all the checks
    for (let i = 0; i < checks.length; i++) {
      s += '<div class="check_row" style="background-color:' + bk[i % 2] + '">';
      s += '<div class="check_name" >' + i + ') ' + checks[i].name + '</div>';
      let alval = '';
      if (checks[i]['al'] === true) {
        alval = ' checked';
      }
      s += '<div class="al_cb">';
      s += "<input type='checkbox'" + alval + ">";
      s += '</div>';
      let coval = '';
      if (checks[i]['co'] === true) {
        coval = ' checked';
      }
      s += '<div class="co_cb">';
      s += "<input type='checkbox'" + coval + ">";
      s += '</div>';
      s += '</div>';
    }
    s += '<br>';
    // finally put the OK button at the bottom
    s += '<div style="margin-right:3%">';
    s += '<button class="butt_class1" style="padding:2px 10px;">OK</button>';
    s += '</div>';
    ob.s = s;
    return true;
  }

  //****************************************
  // event handler when clicking OK in the checklist dialog
  //****************************************

  $('#checklist_container').on('click', 'button', function (e) {
    // clicking on the OK button the checklist dialog
    hideDialog('checklist_container');
    // update the checks array
    // first use jQ to get the input values
    let $clal = $('#checklist_container .al_cb>input');
    let $clco = $('#checklist_container .co_cb>input');
    // now write the new values to the checks array
    for (let i = 0; i < checks.length; i++) {
      checks[i].al = $clal[i].checked;
      checks[i].co = $clco[i].checked;
    }
  });


  ////////////////////////////////////////////////////////////////////
  function NOT_USED_AT_THIS_TIME() { }
  ////////////////////////////////////////////////////////////////////



  ////////////////////////////////////////////////////////////////////
  function AUDIO_VOLUME() { }
  ////////////////////////////////////////////////////////////////////

  // ***********************
  // variables and functions for playing audio and getting the audio volumes
  // ***********************

  let isActive = true;   // if isActive is true then the page has focus

  let default_volumes = {
    r1: 1,   // make starting volume for correct/wrong be 100%
    r2: 0.7,  // make starting volume for background be 70%
    r3: 1  // make starting volume for q/options be 100%
  };

  function playCorrectOrWrong(corr) {
    if (!isActive) return;
    if (corr) {
      correct_beep.play();
    } else {
      wrong_beep.play();
    }
  }

  function Audiovolume() {   // called from submenu which created at runtime
    // clicking on Settings -> Audio volume submenu
    showDialog('getaudiovolume');
  }

  $('#getaudiovolume button').on('click', function (e) {
    let butt = $(this).text();
    if (butt == 'Reset') {
      sd1.sl_r = default_volumes.r1;
      sd1.initBall();
      sd2.sl_r = default_volumes.r2;
      sd2.initBall();
      sd3.sl_r = default_volumes.r3;
      sd3.initBall();
    } else {
      hideDialog('getaudiovolume');
    }
  });

  function setVolume() {
    let vol = sd.sl_r * sd1.sl_r;
    correct_beep.volume = vol;
    wrong_beep.volume = vol;
    vol = sd.sl_r * sd2.sl_r;
    backSound.volume = vol;
    backQTimeSound.volume = vol;
    backQSound.volume = vol;
    vol = sd.sl_r * sd3.sl_r;
    $('#clips0 audio').each(function () { this.volume = vol; });
    $('#clips1 audio').each(function () { this.volume = vol; });
  }

  // mouseenter and mouseleave events needed for playing sound clips when the q is displayed 

  $('#wrapper').on('mouseleave', '.qq, .opt_class2', function __mouseLeave__(e) {
    e.stopPropagation(); // Stop stuff happening
    e.preventDefault(); // Totally stop stuff happening
    let choice = parseInt(this.id.charAt(this.id.length - 1), 10);
    if (isClip[aon][choice]) {
      $ao[aon][choice].pause();
      clipOn = -1;
    }
  });

  $('#wrapper').on('mouseenter', '.qq, .opt_class2', function __moveOverOption__(e) {
    e.stopPropagation(); // Stop stuff happening
    e.preventDefault(); // Totally stop stuff happening
    let choice = parseInt(this.id.charAt(this.id.length - 1), 10);
    if (isClip[aon][choice]) {
      $ao[aon][choice].currentTime = 0;
      $ao[aon][choice].play();
      clipOn = choice;
    }
  });

  function pauseBackgroundSound(n) {
    if (n < 1) return;
    if (n === 1) {
      backSound.pause();
    } else if (n === 2) {
      backQTimeSound.pause();
    } else {   // n must be 3
      backQSound.pause();
    }
  }

  function checkBackgroundSound() {
    if (!isActive) return;
    if (mostate === 0) {   // ie waiting for an answer
      if (isBackQSound) {  // if there is a bg sound for the question then play it
        if (bgSoundOn === 1) backSound.pause();
        backQSound.play();
        bgSoundOn = 3;
      } else if (isBackQTimeSound) {  // if there is a bg QTime sound for the file then play it
        if (bgSoundOn === 1) backSound.pause();
        backQTimeSound.play();
        bgSoundOn = 2;
      }
    } else {   // the file Background sound should play if there is one
      if (isBackSound) {
        backSound.play();
        bgSoundOn = 1;
      } else {
        bgSoundOn = 0;
      }
    }
  }

  function stopBackgroundSound() {
    if (bgSoundOn === 0) return;
    if (bgSoundOn === 1) {
      backSound.pause();
    } else if (bgSoundOn === 2) {
      backQTimeSound.pause();
    } else {   // bgSoundOn = 3
      backQSound.pause();
    }
  }

  // the blur and focus events needed for playing audio

  $(window).blur(function () {
    isActive = false;
    $('#bodymask').removeClass('nodisplay');
    if (mostate === -2) return;    // no sounds should be playing
    if (mostate === -1 || mostate === 1) {  // only need to check the overall background sound
      if (isBackSound) backSound.pause();
    } else {   // mostate must be 0 so check background sounds and q & options clips
      if (isBackQSound) {
        backQSound.pause();
      } else if (isBackQTimeSound) {
        backQTimeSound.pause();
      } else if (isBackSound) {
        backSound.pause();
      }
      if (clipOn >= 0) {
        $ao[aon][clipOn].pause();
      }
    }
  });

  $(window).focus(function () {
    isActive = true;
    $('#bodymask').addClass('nodisplay');
    if (mostate === -2) return;    // no sounds should be playing
    checkBackgroundSound();
  });

  //***************
  //** This function is for testing - I used it a lot when resizing the window to see how things look
  //** It will only get called if debugon is true
  //***************
  function getDimensions() {
    let s = '';
    let wrap = document.getElementById('wrapper');
    let c4 = wrap.clientHeight;
    let c2 = wrap.offsetHeight;
    let c3 = wrap.scrollHeight;
    let c5 = wrap.clientWidth;
    let c6 = wrap.offsetWidth;
    let c7 = wrap.scrollWidth;

    let $wrap = $('#wrapper');
    let c8 = $wrap.outerHeight();
    let c9 = $wrap.outerWidth();

    //---------------------------
    // height
    // window
    // jQ
    let t = $(window);
    let w3 = t.innerHeight();
    let w2 = t.outerHeight();
    let x2 = t.outerHeight(true);
    let x3 = t.height();
    /*   s += "$(window)" + '  ' + ".innerHeight() = " + w3  + '\n';
      s += ".outerHeight() = " + w2  + '\n';
      s += ".outerHeight(true) = " + x2  + '\n';
      s += ".height() = " + x3  + '\n';
     */

    // js
    let e2 = window.innerHeight;
    let y6 = window.outerHeight;

    // document.body
    // jQ
    let d1 = $(document).height();
    let d11 = $(document).innerHeight();
    let d12 = $(document).outerHeight();
    let d13 = $(document).outerHeight(true);
    let d14 = $('body').height();
    let d15 = $('body').innerHeight();
    let d16 = $('body').outerHeight();
    let d17 = $('body').outerHeight(true);
    // js
    let b1 = document.body.clientHeight;
    let d3 = document.body.offsetHeight;
    let d4 = document.body.scrollHeight;
    //-------------------------------------------
    // width
    // window
    // jQ
    let w5 = $(window).innerWidth();
    let w4 = $(window).outerWidth();
    let x4 = $(window).outerWidth(true);
    let x5 = $(window).width();
    // js
    let w6 = window.innerWidth;
    let w7 = window.outerWidth;

    // document.body
    // jQ
    let d5 = $(document).width();
    let d20 = $(document).innerWidth();
    let d21 = $(document).outerWidth();
    let d22 = $(document).outerWidth(true);
    let d23 = $('body').width();
    let d24 = $('body').innerWidth();
    let d25 = $('body').outerWidth();
    let d26 = $('body').outerWidth(true);
    //js
    let b11 = document.body.clientWidth;
    let b12 = document.body.offsetWidth;
    let b13 = document.body.scrollWidth;

    /*   s += "window.outerWidth = " + w7  + " || " + "window.outerHeight = " + y6 + '\n';
      s += "$(window).width() = " + x5  + " || " + "window.innerWidth = " + w6  + '\n';
      s += "$(window).height() = " + x3  +  " || " + "window.innerHeight = " + e2  + '\n';
      s += "body width = " + b11  + "   body height = " + b1  + '\n';
      //s += "$body width = " + d23  + "   $body height = " + d14  + '\n';
      s += "wrapper width = " + c5  + "   wrapper height = " + c4  + '\n';
      //s += "$wrapper width = " + c9  + "   $wrapper height = " + c8  + '\n';
      
      //s += "window" + '  ' + ".innerWidth = " + w6  + '\n';
      //s += "window" + '  ' + ".innerHeight = " + e2  + '\n';
      
      s += "document.body.clientWidth = " + b11  + "   document.body.scrollWidth = " + b13  + '\n';
      s += "document.body.clientHeight = " + b1  + "   document.body.scrollHeight = " + d4  + '\n';
      
      return s;
     */
    s += "window.outerWidth = " + w7 + " || " + "window.outerHeight = " + y6 + '\n';
    s += "window.innerWidth = " + w6 + " || " + "window.innerHeight = " + e2 + '\n';
    s += "$(window).width() = " + x5 + " || " + "$(window).height() = " + x3 + '\n';
    s += "-----------------------------------------------------------------------" + '\n';
    s += "$('body').outerWidth(true) = " + d26 + " || " + "$('body').outerHeight(true) = " + d17 + '\n';

    return s;

    if (b1 > w2) {
      // there is a rhs scroll
      myCheck(5, 'rhs scroll');
    }
    if (b11 > w5) {
      // there is a lhs scroll
      myCheck(5, 'bottom scroll');
      if (b1 > w2) {
      }
    }

    if (w6 > x4) {
      myCheck(5, 'rhs scroll using window dimensions');
    }

    if (e2 > x2) {
      myCheck(5, 'bottom scroll using window dimensions');
    }

    let z3 = document.body.getBoundingClientRect();
    //let z4 = window.getBoundingClientRect();
    let z5 = wrap.getBoundingClientRect();

    //document.body.style.overflowX = "hidden";
    let z0 = document.body.style.overflow;
    let z1 = document.body.style.overflowX;
    let z2 = document.body.style.overflowY;
  }



});

