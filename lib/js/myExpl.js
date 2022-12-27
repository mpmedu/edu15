"use strict";

xx.module('myExpl', function (apod) {
  let vars = xx.vars;

  // var common, gen;
  var common, edu, q;
  if (xx.q) q = xx.q;
  xx.imports.push(function () {
    common = xx.common;
    // gen = xx.gen;
    edu = xx.edu;
    q = xx.q;
  });

  apod.extend({
    showTheFolders: showTheFolders
  });

  window.addEventListener('load', function () {
    //let ob1 = common.myPosition('files_div','myExplorer');
  });

  window.addEventListener('domready', function () {  // this doesn't work
    let ob1 = common.myPosition('files_div', 'myExplorer');
  });

  ////////////////////////////////////////////////////////////////////////
  function MY_EXPLORER() { }
  ////////////////////////////////////////////////////////////////////////

  function doFetch(url, todo, params, data, loadmsg, fn) {
    let ob = { 'url': url, 'loadmsg': loadmsg };
    common.loadingOn(ob);
    let c = '?';
    if (todo) {
      url = 'lib/php/' + url + '?todo=' + todo;
      c = '&';
    }
    if (params) url = url + c + q.param(params);
    fetch(url, {
      method: "POST",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        //"Content-Type": "application/json; charset=UTF-8"
        "Content-Type": "application/json"
        // "Content-Type": "application/x-www-form-urlencoded"
      },
      body: JSON.stringify(data)
      // body: data
    })
      .then(res => res.json())
      .then(json => {
        if (fn && (typeof fn == "function")) fn(json);
        //console.log(json);
        common.loadingOff();
      })
      .catch(err => {
        console.log(err);
        common.loadingOff();
      });
  }

  let folders;
  let displaceLeft;   // items in folder_div to be moved left if no sub-folders

  function showTheFolders() {
    // gen.init();
    displaceLeft = true;
    folders = new foldersClass({ dir: vars.docPath, notdirs: '_files' });
    folders.getFob();  // this also displays the folders and files
}



  function theFolders(json) {
    // turn itemPopup off just in case it is still showing
    let ele = q._('itemPopup');
    ele.classList.remove('chosen');
    ele.classList.add('nodisplay');
    try {
      let s;
      // s = jsFolders(json, 0, 0);   // include the root directory
      s = jsFolders(json, 1, 0);      // don't include the root directory
      return s;
    } catch (e) {
      alert("error : " + e);
    }
  }


  // Note that the spans are put together to prevent space gaps between the elements    
  function jsFolders(json, p, level) {
    let s = '<div class="items level' + level + '">';
    while (true) {
      if (json.ps[p] > 0) {
        // there are subfolders
        s += `<div id="ai_${p}">
          <span class="indx">${common.getHtml('plusMinus')}</span><span class="holder"><span 
          class="directory"></span><span class="itemName">${json.f[p]}</span>
          </span>
          </div>
          <div class="subcatlistdiv nodisplay">
          ${jsFolders(json, json.ps[p], level + 1)}
          </div>`;
        if (level === 0) displaceLeft = false;
      } else {
        // no subfolders
        s += `<div id="ai_${p}">
            <span class="indx"></span><span class="holder"><span 
            class="directory"></span><span class="itemName">${json.f[p]}</span>
            </span>
            </div>`;
      }
      p = json.pn[p];
      if (p === 0) return (s + "</div>");
    }
  }

  // .inbox is the plus or minus icon to open or close a folder
  q.delegate('folders_div', 'click', '.inbox', function __clickOnOpenorCloseFolder(e) {
    //e.stopPropagation(); 
    //alert('in .inbox');
    let svg = this.parentNode;
    let doorClosed = svg.getAttribute('data-closed');
    if (doorClosed === 'true') {
      // sideways, ie closed, so open folder
      let items = svg.parentNode.parentNode;
      svg.querySelector('line.down').classList.add('nodisplay');
      svg.setAttribute('data-closed', false);
      items.nextElementSibling.classList.remove('nodisplay');
    } else if (doorClosed === "false") {
      // down, ie open, so close folder
      // I must check if this folder which is been closed contains the chosen folder
      // and if so then I must turn the chosen folder off
      let items = svg.parentNode.parentNode;
      let selected = folders.getSelected();
      if (selected >= 0) {
        let thisid = Number(items.id.slice(3));
        if (folders.isADecendentOf(selected, thisid)) {
          // the currently selected folder is a decendent of the folder that is now
          // being closed, so make selected be -1 and turn chosen off
          folders.setSelected(-1);
          // remove files from files_div
          q._('files_div').innerHTML = '';
        }
      }
      svg.querySelector('line.down').classList.remove('nodisplay');
      svg.setAttribute('data-closed', true);
      items.nextElementSibling.classList.add('nodisplay');
    }
  });


  // ******************************************
  // event handlers and routines for clicks and mouse events on items in the folder list in left column
  // ******************************************

  let onFolder;  // this is the folder that the mouse is over, if clicked it becomes the selected folder

  q.delegate('folders_div', 'mouseover', '.holder', function __mouseoverOnHolder(e) {
    //e.stopPropagation();
    let ele = document.querySelector('#itemPopup');
    let offs = q.myOffset(this, 'myExplorer', ele);
    //  left = offs[1] and top = offs[0];
    ele.style.left = offs[1] + 'px';
    ele.style.top = offs[0] + 'px';
    ele.innerHTML = common.htmlspecialchars_decode(this.innerHTML);
    ele.classList.remove('nodisplay');
    onFolder = this;
  });

  /* 
  The next 2 events turn off itemPopup if 
  a) the mouse exited itemPopup or 
  b) the mouse exited the underlying span.holder.
   */
  q._('itemPopup').addEventListener('mouseout', function __mouseoutItemPopup(e) {
    //e.stopPropagation();    // I don't think this is needed here
    if (q.isChildOf(this, e.relatedTarget)) return;
    this.classList.add('nodisplay');
    onFolder = null;
  });

  // Note that this might not be needed because once the mouse enters span.holder 
  // then div#itemPopup covers the span.holder element. But I have found itemPopup 
  // might not completely cover span.holder - I don't know why so I have put this 
  // here just in case.
  q.delegate('folders_div', 'mouseout', '.holder', function __mouseoutFromItemName(e) {
    //e.stopPropagation();
    if (e.relatedTarget.parentNode.id == 'itemPopup') return;
    if (e.relatedTarget.id == 'itemPopup') return;
    q._('itemPopup').classList.add('nodisplay');
  });

  // click on itemPopup
  q._('itemPopup').addEventListener('click', function __clickItemPopup(e) {
    e.stopPropagation();
    let item = onFolder.parentNode;
    let ai_id = Number(item.id.slice(3));
    // turn itemPopup > span.itemName on
    let ele = this.querySelector('span.itemName');
    if (ele) ele.classList.add('chosen');  // ele will be null at start-up so test
    // turn the folder that is now selected on  
    folders.setSelected(ai_id);  // turns old folder off and new folder on
    let fp = folders.fullPath(ai_id);
    // turn the spinner on while the files are fetched
    //showSpinner(this,onFolder)

    // onFolder.classList.add('wait');

    this.classList.add('wait');
    let savethis = this;

    // get the files in the folder clicked, ie fp, and show them in files_div
    let data = { dir: fp };
    doFetch('general.php', 'getFiles', null, data, '', function (json) {
      //turnOffSpinner(this,onFolder);
      // onFolder.classList.remove('wait')
      savethis.classList.remove('wait');

      if (json.value === 'success') {
        files_div.innerHTML = filesList(fp, json.files);
        q._('fn_input').value = '';
      } else {
        if (json.errmsg != undefined) {
          alert(json.errmsg);
        } else {
          alert('There was a problem with Fetch call');
        }
      }
    });
  });

  function showSpinner(popup, fold) {
    // show a spinner when a folder is clicked and files are fetched

  }

  function filesList(fp, arr) {
    let ss = '<ul class="fileTree" data-fp="' + fp + '">';
    for (let i = 0; i < arr.length; i = i + 2) {
      ss += '<li data-fp="' + fp + arr[i] + '"><span class="file ext_' + arr[i + 1] + '">' + arr[i] + '</span></li>';
    }
    return ss + "</ul>";
  }

  let fname;
  let singleclickdone;   // needed for checking double click when opening a file
  let selected_file = null;

  q.delegate('files_div', 'click', 'li', function __clickOnFilename(e) {
    fname = this.dataset.fp;
    if (fname != selected_file) {
      selected_file = fname;
      q.removeAllClasses('#files_div li', 'selected');
      this.classList.add('selected');
      q._('fn_input').value = fname.substring(fname.lastIndexOf('/') + 1);
    }
    singleclickdone = true;
  });

  q.delegate('files_div', 'dblclick', 'li', function __dblclickOnFilename(e) {
    if (singleclickdone === true) {
      edu.checkopenfile('Open', fname);
    }
  });

  q.delegate('myExplorer', 'click', 'button', function __clickButtonInMyExplorer(e) {
    let butt = this.textContent;
    if (butt == 'Reset') {
      showTheFolders();
      return;
    }
    // either 'Open' or 'Cancel'
    edu.checkopenfile(butt, fname);
  });

  class foldersClass {
    constructor(data) {
      this.data = data;
      this.selected = -1;
      this.parr = [];
    }

    getFob() {
      doFetch('general.php', 'getFolders', null, this.data, '', json => {
        this.fob = json;
        this.putFob();
        this.fix_parr();
        onFolder = q._('folders_div').querySelector('.holder');  // will find the first span.holder element
        q.trigger('itemPopup', 'click');
      });
    }

    putFob() {
      let ele = document.getElementById('folders_div');
      ele.innerHTML = theFolders(this.fob);
      // if no subfolders then move items left
      if (displaceLeft) { 
        q._('folders_div').querySelector('.items').style.marginLeft = -14 + 'px'; 
      }
  
    }

    setSelected(n) {
      if (this.selected >= 0) q._('ai_' + this.selected).querySelector("span.itemName").classList.remove('chosen');
      this.selected = n;
      if (n >= 0) q._('ai_' + this.selected).querySelector("span.itemName").classList.add('chosen');
    }

    getSelected() {
      return this.selected;
    }

    fix_parr() {
      this.parr[0] = 0;
      this.parr_fixsub(0);
    }

    parr_fixsub(p) {
      let pp = this.fob.ps[p];
      while (pp != 0) {
        this.parr[pp] = p;
        if (this.fob.ps[pp] > 0) this.parr_fixsub(pp);
        pp = this.fob.pn[pp];
      }
    }

    // This function returns true if idn1 is a decendent of idn2
    isADecendentOf(idn1, idn2) {
      let p = idn1;
      while (p > 0) {
        p = this.parr[p];
        if (p === idn2) return true;
      }
      return false;
    }

    fullPath(id) {
      let f = this.fob.f;
      let s = '';
      while (id != 0) {
        s = f[id] + '/' + s;
        id = this.parr[id];
      }
      return xx.vars.docPath + s;
    }
  }  // end of folderClass

});
