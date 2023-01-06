  
 <!--
 ********************************************
 The audio tags - their position in the html is not important
 ********************************************
-->

  <!-- audio tags for playing correct/wrong wav files -->
  <audio id="correct_clip" src="res/Correct.wav" preload="auto">  </audio>
  <audio id="wrong_clip" src="res/Wrong.wav" preload="auto">  </audio>
  
  <!-- audio tags for background and QTimeBackground wav files -->
  <audio id="back_sound" src="" preload="auto" loop>  </audio>
  <audio id="backQTime_sound" src="" preload="auto" loop>  </audio>
  <audio id="backQ_sound" src="" preload="auto" loop>  </audio>
  
  <!-- audio tags for q and options wav files -->
  <div id="clips0">
    <audio src="" preload="auto">  </audio>
    <audio src="" preload="auto">  </audio>
    <audio src="" preload="auto">  </audio>
    <audio src="" preload="auto">  </audio>
    <audio src="" preload="auto">  </audio>
    <audio src="" preload="auto">  </audio>
  </div>
  <div id="clips1">
    <audio  src="" preload="auto">  </audio>
    <audio  src="" preload="auto">  </audio>
    <audio  src="" preload="auto">  </audio>
    <audio  src="" preload="auto">  </audio>
    <audio  src="" preload="auto">  </audio>
    <audio  src="" preload="auto">  </audio>
  </div>

  
 <!--
 ********************************************
 needed to get the tick position
 ********************************************
-->
<div id="opt_get_height" class="opt_class" style="visibility:hidden;">
  <div class="n_cell">
    <div id="opt_num7" class="n_format">7</div>
  </div>
</div>


 <!--
 ********************************************
 for showing the checklist dialog
 ********************************************
-->
<div id="checklist_container" class="container_class nodisplay"></div>
  
  
 <!--
 ********************************************
 for showing spinner and mask when Ajax is called
 ********************************************
-->
<div id='loading' class="nodisplay box" style='background-color:white;width:200px;'>
  <div id='loadmsg' style='margin-bottom:6px'>Loading, please wait</div>
  <img src="res/spinner.gif">
</div>
<div id='loadingmask' class="nodisplay"></div>


 <!--
   ********************************************
  <div>s for showing message in dialog box, either with OK or with Yes No 
  and the background mask for this dialog
   ********************************************
  -->
   
  <div id="msgbox" class="nodisplay mbox">
    <br>
    <span class="bmessage"></span>
    <br><br>
    <p id='msgButton' class='nodisplay'> <button>OK</button> </p>
    <p id='yesnoButtons' class='nodisplay'>
      <button style='margin-right:10px;'>Yes</button>
      <button>No</button>
    </p>
  </div>
    
  <div id="msgboxmask" class="nodisplay"></div>

  <!--
   ********************************************
  the flashbox is for showing short messages, it dissapears after a second or two
   ********************************************
  -->
  <div id="flashbox"  class="nodisplay box">
    <br>
    <p id="flashmsg"  style="font-size:1.6em; display:inline;"></p>
  </div>
  
  <!--
   ********************************************
  the endbox is for showing the score at the end of the game
   ********************************************
  -->
  <div id="endbox"  class="nodisplay box">
    <br>
    <p id="endmsg"  style="font-size:1.5em; display:inline;"></p>
    <br>
    <p style='text-align:center;'>
    <button>OK</button>
    </p>
  </div>

  <!--
   ********************************************
  The html for the file explorer, needed to open files on the server
   ********************************************
  -->

<div id="myExplorer" class="box nodisplay">
  <div id = "itemPopup" class='nodisplay'></div>
  <div class="myExp_div1" style="margin:0 15px;" >
    <h3 class="myExp_h3_cls1">Folders</h3>
    <div id="folders_div" class="myExp_div2"></div>
    <p><button style="margin-top:10px;" >Reset</button></p>
  </div>
  <div class="myExp_div1" style="margin-left:0; margin-right:15; float:right;">
    <h3 class="myExp_h3_cls1">Files</h3>
    <div id="files_div" class="myExp_div2"></div>
    <p style="margin-bottom:0">Filename: <input id="fn_input" type="text" disabled="true" style="width:170px; padding-left:3px; margin:5px 0px 8px 0; color:black;"></p>
    <p style="float:right"><button id="func1">Open</button><button id="canc1">Cancel</button> </p>
  </div>
  <div style="clear:both"></div>
</div>

   <!--
   ********************************************
  <svg> for plus and minus icons to expand or contract folders
   ********************************************
  -->
  <div id='plusMinus' class='nodisplay'>
    <svg  width=14 height=18 data-closed=true>
      <rect class='inbox'  x="2" width="9" y="5" height="9" fill="#666" />
      <rect class='inbox'  x="3" width="7" y="6" height="7" fill="#fff" />
      <line class='inbox' x1="4" x2="9" y1="10" y2="10" stroke="#000" stroke-width="2"  />
      <line class='inbox' x1="4" x2="9" y1="11" y2="11" stroke="#fff" stroke-width="2"  />
      <line class='inbox down' y1="7" y2="12" x1="7" x2="7" stroke="#000" stroke-width="2"  />
      <line class='inbox down' y1="7" y2="9" x1="8" x2="8" stroke="#fff" stroke-width="2"  />
      <line class='inbox down' y1="10" y2="12" x1="8" x2="8" stroke="#fff" stroke-width="2"  />
    </svg>
  </div>



  <!--
   ********************************************
  This is the container that is used to show the list of categories in the qna file.
  The category list is made in js by the function getcatarray()
   ********************************************
  -->
<div id="catlist_container" class="container_class nodisplay"></div>

  <!--
   ********************************************
  The next 3 are dialogs for getting input from the user.  They are activated by clicking
  one of the submenus under the Settings menu.
   ********************************************
  -->

<!-- the dialog for getting no of qs in test -->
<div id="getnumqs" class="nodisplay div_nq_ta_av">
  <div style="border:solid 2px #ccc;padding:10px;">
    <div style="text-align:center;font-weight:bold; text-decoration:underline">Setting the number of questions</div>
    <br>
    <div style="width:235px;height:3em;position:relative">
      <div>Default no of questions in a test</div>
      <div style="position:absolute; top:-3px;right:0;">
        <input id="gnq1_input" class="input_nq_ta" type="text" disabled="true">
      </div>
    </div>
    <div style="width:235px;height:2em;position:relative">
      <div>Enter no of questions in the test</div>
      <div style="position:absolute; top:-3px;right:0;">
        <input id="gnq2_input" class="input_nq_ta" type="text" style="background-color:white;">
      </div>
    </div>
    <br>
    <p style='text-align:center;'>
    <button>Reset</button>
    <button>Cancel</button>
    <button>Apply</button>
    </p>
  </div>
</div>

<!-- the dialog for getting the time allowed -->
<div id="gettimeallowed" class="nodisplay div_nq_ta_av">
  <div style="border:solid 2px #ccc;padding:10px;">
    <div style="text-align:center;font-weight:bold; text-decoration:underline">Setting the time allowed</div>
    <br>
    <div style="width:235px;height:3em;position:relative">
      <div>Default time allowed (seconds)</div>
      <div style="position:absolute; top:-3px;right:0;">
        <input id="gta1_input" class="input_nq_ta" type="text" disabled="true">
      </div>
    </div>
    <div style="width:235px;height:2em;position:relative">
      <div>Actual time allowed (seconds)</div>
      <div style="position:absolute; top:-3px;right:0;">
        <input id="gta2_input" class="input_nq_ta" type="text" style="background-color:white;">
      </div>
    </div>
    <br>
    <p style='text-align:center;'>
    <button>Reset</button>
    <button>Cancel</button>
    <button>Apply</button>
    </p>
  </div>
</div>

<!-- 
the dialog for getting the audio volumes for
a) Correct/Wrong sounds
b) Background sound
c) Question/Options sounds
-->
<div id="getaudiovolume" class="nodisplay div_nq_ta_av">
  <div style="border:solid 2px #ccc;padding:10px;">
    <div style="text-align:center;font-weight:bold; text-decoration:underline">Setting the audio volume</div>
    <br>
    <div class="outer_sd">
      <div>Correct/Wrong volume</div>
      <div class="inner_sd">
        <div id="cont_v1" class="cont_class roundCorners">
          <div id="ball_v1" class="ball_class roundCorners"></div>
        </div>
      </div>
    </div>
      
    <div class="outer_sd">
      <div>Background volume</div>
      <div class="inner_sd">
        <div id="cont_v2" class="cont_class roundCorners">
          <div id="ball_v2" class="ball_class roundCorners"></div>
        </div>
      </div>
    </div>
    
    <div class="outer_sd">
      <div>Question/Options volume</div>
      <div class="inner_sd">
        <div id="cont_v3" class="cont_class roundCorners">
          <div id="ball_v3" class="ball_class roundCorners"></div>
        </div>
      </div>
    </div>
    
    <br>
    <p style='text-align:center;'>
    <button>Reset</button>
    <button>OK</button>
    </p>
  </div>
</div>


  <!--
   ********************************************
  the next 2 are for displaying a question and the options
   ********************************************
  -->
<!-- to display the question -->
<div id="tem_q"  class="nodisplay">
  <div class="q">
  <div id="qq{n}" class="qq" style="position:relative;padding-left:25px;">
    <div class="" style="position:absolute; top:8px;left:15px;">{si}</div>
    <div class="qo_outer_text {offstyle}">
      <div class="qt qo_cell_text q_cell_text">{q}</div>
    </div>
    {p0}
  </div>
  </div>
</div>
  
<!-- to display an option, each option needs one of these -->
<div id="tem_opt" class="nodisplay">
  <div id="opt_div{n}" class="opt_class opt_class2">
    <div class="n_cell">
      <div id="opt_num{n}" class="n_format n_format2">{n}</div>
      <div class="" style="position:absolute; top:4px;right:-10px;">{si}</div>
    </div>
    <div class="qo_outer_text {offstyle}">
      <div class="qo_cell_text o_cell_text">{opt}</div>
    </div>
    {pn}
  </div>
</div>

<!-- 
  *****************************************
  the box that shows the Terms and Conditions at startup 
  *****************************************
-->
<div id="startupbox" class="nodisplay box" style="text-align:left;padding:2em;">
  <div class='boxHead1_class'>Terms and conditions</div>
  <div class='boxContent1_class'>
    1) The files available for use on this website have been created by various people. 
    The files have been checked for viruses/malware. However there is no assurance as far as the correctness 
    of their content is concerned.<br>
    2) You should verify the information obtained from the files if it is important to you.<br>
    3) The owners of this site will not be held liable for the contents contained in the files.<br>
    4) Please click on 'Accept' if you agree to these terms and conditions.<br>
  </div>
  <br><br>
  <p style='text-align:center;'>
  <button>Leave this page</button>
  <button>Accept</button>
  </p>
</div>


  <!--
   ********************************************
  Information on how to play the game etc
  There should be no elements with ids (except for the outer one) because this html gets moved from here
  to inside the wrapper and then back again
   ********************************************
  -->
<div id="tem_info" class="nodisplay">
  <div class="info">
    <br><br>
    <div class='info_class'>How to play the game ...</div><br>
    <div class='nodisplay content_class'>
      1) Click on 'Open File' and then select a qna file. <br>
      2) Once a file is open click on 'New game' to prepare the questions for a test. The button will 
      change to 'Start'.<br>
      3) When you click on 'Start' the first question will be displayed and the clock will start.<br>
      4) To select an answer move the cursor over it and then click on it.<br>
      5) The score will be updated. To continue click anywhere in the display area and the next question will show.<br>
      6) When all questions have been answered the final score will appear in a pop-up box.<br>
      7) You can click on the 'End' button at any time during the test to end it.<br>
      <br>
      If a file is open and the 'New game' button is showing you can click on 'Categories' to view and select categories for inclusion in the test.<br>
      The default number of questions in a test is 20. You can change this by clicking on 'Settings' -> 'Number of questions'.<br>
      You can set the time allowed per question using 'Settings' -> 'Time allowed'.<br>
    </div>
    
    <div class='info_class'>About this program ...</div><br>
    <div class='nodisplay content_class'>
      1) This program is based on a Windows application called QnA.<br>
      2) It does not make use of a database. Instead it uses qna files.<br>
      3) A qna file is created with a free application called EditQnA. To get the EditQnA program 
      see 'Create your own files ...' .<br>
    </div>
    
    <div class='info_class'>Create your own files ...</div><br>
    <div class='nodisplay content_class'>
      1) Send an email to <a href=mailto:mpm.edu@gmail.com>mpm.edu@gmail.com</a> 
      and request the QnA package.<br>
      2) The package consists of two programs, QnA and EditQnA, which run on Windows.<br>
      3) Run the installation program which will install the two programs on your computer. To create qna 
      files use EditQnA.<br>
      4) If you would like your own qna file to be added to the files on this website then send it by email 
      attachment to the address above. If there are no problems with the file then it will be uploaded 
      and can be used by anyone visiting the site.<br>
      5) If you make a Restricted-access file (see below) then be sure to fill in your contact details and 
      other necessary information.<br>
    </div>
    
    <div class='info_class'>Restricted-access files ...</div><br>
    <div class='nodisplay content_class'>
      1) Some of the qna files on this site are Restricted-access files allowing access to only a limited 
      number of questions.<br>
      2) To unlock the file and make it fully operational you must request the key from the creator of the 
      file. An email address is provided.<br>
    </div>
    
    <div class='info_class'>More about qna files and the EditQnA application ...</div><br>
    <div class='nodisplay content_class'>
      1) The EditQnA application can be used to create and edit qna files.<br>
      2) You can create as many categories in a file as you want.<br>
      3) You can include a picture in questions or options.<br>
      4) A useful feature is that you can merge two or more qna files which means that files created by several people 
      can be merged into one large file.<br>
      5) The files can be edited - questions can be changed, deleted, or moved from one category to another.<br>
      6) The application has a search facility to find and change text in questions, options or categories.<br>
      7) Pictures can be chosen from anywhere on your hard drive or connected storage. You can then choose 
      to copy them to a folder in the same location as your qna file.<br>
      8) You can make your file to be a Restricted-access file (see above). If you wish you can charge users 
      a fee for the key to unlock the file and make it fully operational.<br>
    </div>
  </div>
</div>


<!-- 
   ********************************************
  the box to register a qna file, enter a key to unlock the file 
   ********************************************
-->
<div id="unlockbox" class="nodisplay box" style="z-index:9000;text-align:left;padding:2%;background-color:#fff;">
  <div class='boxHead1_class'>Restricted-access file</div>
  <div class='boxContent1_class'>
    1) This is a restricted-access file.<br>
    2) To unlock the file you need to transact with the person who created the file. Proceed as follows:<br>
    <div class='contact_class'>
      a) Contact the creator and request the key to unlock the file. See contact details below. You will have to 
      supply him/her with the computer ID and the name of the file.<br>
        <div id="contactdetails" style="display: inline-block;">
        </div>
        <br>
      b) When you receive it enter the key in the space provided below and then click on 'Next'.<br>
      c) The file will be registered and will then be fully operational on your computer. <br>
    </div>
    3) Note that cookies must be enabled on your computer so that the file will open correctly in future.
  </div>
  <br><br>
  <div id='unlocksection' class='content_class'>
    <div style="display: inline-block;padding:1px 0;">
      <div style="display: inline-block;width:90px;">
      Computer ID
      </div>
        <input id="gcode_input1" class="input_key" type="text" disabled="true">
    </div>
    <br>
    
    <div style="display: inline-block;padding:1px 0;">
      <div style="display: inline-block;width:90px;">
      Filename
      </div>
        <input id="gcode_input2" class="input_key" type="text" disabled="true">
    </div>
    <br><br>
  
    <div style="display: inline-block;">
      <div style="display: inline-block;width:90px;">
      Enter the key
      </div>
      <input id="gcode_input3" class="input_key" type="text" style="background-color: white;">
    </div>
  </div>
  <br><br>
  <p style='text-align:center;'>
  <button>Next</button>
  <button>Exit</button>
  </p>
</div>
 
 
<!-- not used at this stage -->
<div id="adminbox" class="nodisplay box" style="text-align:left;padding:20px;height:auto;overflow:auto;">
</div>


<!-- 
   ********************************************
  creator login box so that the creator can enter his password 
   ********************************************
-->
<div id="creatorloginbox" class="nodisplay box" style="text-align:left;padding:20px 20px 15px 15px;">
  <div style="text-align: center;width:260px; font-weight:bold;font-size:1.3em;">
  Enter the password for this file
  </div>
  <br>
  <div style="padding:1px 0;">
    <div style="text-align: right;padding-right:1em;display: inline-block;width:70px;">
    Filename
    </div>
    <input id="clb1_input" class="input_key" type="text" disabled="true">
  </div>
  <br>
  <div style="padding:1px 0;">
    <div style="text-align: right;padding-right:1em;display: inline-block;width:70px;">
    Password
    </div>
    <input id="clb2_input" class="input_key" type="password">
  </div>
  <br>
  <p style="text-align:center;">
  <button>Next</button>
  <button>Cancel</button>
  </p>
</div>

<!-- 
   ********************************************
  getqnakeybox is so that the creator can get the key for this file 
   ********************************************
-->
<div id="getqnakeybox" class="nodisplay box" style="text-align:left;padding:20px 25px 15px 15px;">
  <div style="text-align: center;width:260px; font-weight:bold;font-size:1.3em;">
  Key to unlock this file
  </div>
  <br>
  <div style="padding:1px 0;">
    <div style="text-align: right;padding-right:0.6em;display: inline-block;width:80px;">
    Computer ID
    </div>
    <input id="gqkb1_input" class="input_key" type="text">
  </div>
  <br>
  <div style="padding:1px 0;">
    <div style="text-align: right;padding-right:0.6em;display: inline-block;width:80px;">
    Filename
    </div>
    <input id="gqkb2_input" class="input_key" type="text" disabled="true">
  </div>
  <br> <br>
  <div style="padding:1px 0;">
    <div style="text-align: right;padding-right:0.6em;display: inline-block;width:80px;">
    Key
    </div>
    <input id="gqkb3_input" class="input_key" type="text" disabled="true">
  </div>
  <br> <br>
  <p style="text-align:center;">
  <button>Calculate key</button>
  <button>Exit</button>
  </p>
  <br>
</div>
  