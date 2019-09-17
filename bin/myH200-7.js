var isDebug = true;

    if ( isDebug )
        console.log('loading');

// see https://www.kirupa.com/html5/creating_a_strobe_light_generator.htm
var requestAnimationFrame = window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.msRequestAnimationFrame;

var powerON = true;
var stopON = true;
var isRunMode = false;

/* H200 with 32K of core memory and 16 registers */

var ContValue = 0;
var AddrValue = 0;
var RegValue  = 0;

var maxAddr = 32768;
var Addresses = new Array(maxAddr);
var Registers = new Array(16);

/* octal-2-decimal conversion */

var octal2decimal = {
    "40000": 16384,
    "20000": 8192,
    "10000": 4096,
    "4000": 2048,
    "2000": 1024,
    "1000": 512,
    "400": 256,
    "200": 128,
    "100": 64,
    "40":  32,
    "20":  16,
    "10":  8,
    "4":   4,
    "2":   2,
    "1":   1
};


var ix2Hcont = new Array("undef","idCnts200","idCnts100",
                         "idCnts40","idCnts20","idCnts10",
                         "idCnts4","idCnts2","idCnts1");

var ix2Haddr = new Array("undef","idAddr40000","idAddr20000","idAddr10000",
                         "idAddr4000","idAddr2000","idAddr1000",
                         "idAddr400","idAddr200","idAddr100",
                         "idAddr40","idAddr20","idAddr10",
                         "idAddr4","idAddr2","idAddr1");

var ix2Hctrl = new Array("undef","idCReg10","idCReg4","idCReg2","idCReg1");


function decimalButtons(isOctalButtons,isFilter) {
    var isDecimal = 0;
    var isBtn = "";
    for ( isBtn in isOctalButtons ) {
        var isStrTag8 = isBtn.replace(isFilter,"");
        //if ( isDebug ) console.log( "decimalButtons.isStrTag8= "+isStrTag8 );
        if ( isOctalButtons[ isBtn ] ){
            /* look-up and add-up decimal value */
            isDecimal += octal2decimal[ isStrTag8 ]; 
            //if ( isDebug ) console.log( "decimalButtons.isDecimal= "+isDecimal );
        }
    }
    return(isDecimal);
};

function intoOctal( isNbr, isVPlist ){
    var isBinA = isNbr.toString(2).split("");
    // aka: (11) ==> ["1", "0", "1", "1"]
    if ( isDebug ) 
        console.log("intoOctal.isBinA: "+isBinA);
    isBinA.reverse;
    
    var isKeysA = Object.keys( isVPlist );
    // aka: isContents => ["idCnts200", "idCnts100", "idCnts40", "idCnts20", "idCnts10", "idCnts4", "idCnts2", "idCnts1"]
    if ( isDebug ) 
        console.log("intoOctal.isKeysA: "+isKeysA);
    isKeysA.reverse;
    
    /* zero each bit of the octal value */
    for ( var myKey in isVPlist ){
        isVPlist[ myKey ] = false;
    }
    
    /* map binary 1's to octal value */
    for ( var ix = 0; ix < isBinA.length; ++ix ) {
        if ( isBinA[ ix ] == "1" ) {
            isVPlist[ isKeysA[ ix ] ] = true;
        }
    }
    
    if ( isDebug ) 
        console.log("intoOctal.isVPlist: "+isVPlist);
};


/* Contents */

var isContents = {
    "idCnts200":   false,
    "idCnts100":   false,
    "idCnts40":   false,
    "idCnts20":   false,
    "idCnts10":   false,
    "idCnts4":   false,
    "idCnts2":   false,
    "idCnts1":   false
};

/* Address */

var isAddress = {
    "idAddr40000":  false,
    "idAddr20000":  false,
    "idAddr10000":  false,
    "idAddr4000":   false,
    "idAddr2000":   false,
    "idAddr1000":   false,
    "idAddr400":   false,
    "idAddr200":   false,
    "idAddr100":   false,
    "idAddr40":   false,
    "idAddr20":   false,
    "idAddr10":   false,
    "idAddr4":   false,
    "idAddr2":   false,
    "idAddr1":   false
};

/* Control Registers */

var isControlRegs = {
    "idCReg10":  false,
    "idCReg4":   false,
    "idCReg2":   false,
    "idCReg1":   false
};

/* blinking map */

var isBlinkMap = {
    "#idCnts200":   "blk8",
    "#idCnts100":   "blk7",
    "#idCnts40":   "blk6",
    "#idCnts20":   "blk5",
    "#idCnts10":   "blk4",
    "#idCnts4":   "blk3",
    "#idCnts2":   "blk2",
    "#idCnts1":   "blk1",
    "#idAddr40000":  "blk8",
    "#idAddr20000":  "blk7",
    "#idAddr10000":  "blk6",
    "#idAddr4000":   "blk6",
    "#idAddr2000":   "blk1",
    "#idAddr1000":   "blk5",
    "#idAddr400":   "blk4",
    "#idAddr200":   "blk4",
    "#idAddr100":   "blk1",
    "#idAddr40":   "blk3",
    "#idAddr20":   "blk3",
    "#idAddr10":   "blk2",
    "#idAddr4":   "blk2",
    "#idAddr2":   "blk1",
    "#idAddr1":   "blk1"
};

/* Sense Switches */

var isSenseSwitch = {
    "idSense4":   false,
    "idSense3":   false,
    "idSense2":   false,
    "idSense1":   false
};

/* -------------------------- */
/* default AC Button settings */

var defineACon = {
    "idACON":   "bGreenON",
    "idACOFF":  "bRedOFF",
    "idDCON":   "bGreenON",
    "idDCOFF":  "bOFF",
    
    "idStop":   "bRedON",
    "idInit":   "bInitOFF",
    "idBoot":   "bBootOFF",
    "idSysClear": "bClearOFF",              
    "idInstruct": "bInstructOFF",
    "idRun":    "bRunOFF",
    
    "idMode2": "b2ON",
    "idMode3": "b3OFF",
    
    "idSense4": "bOFF",
    "idSense3": "bOFF",
    "idSense2": "bOFF",
    "idSense1": "bOFF"
};

var defineACoff = {
    "idACON":  "bGreenOFF",
    "idACOFF": "bRedON",
    "idDCON":  "bGreenOFF",
    "idDCOFF": "bOFF",

    "idStop":   "bRedOFF",
    "idInit":   "bInitOFF",
    "idBoot":   "bBootOFF",
    "idSysClear": "bClearOFF",              
    "idInstruct": "bInstructOFF",
    "idRun":    "bRunOFF",
    
    "idMode2": "b2OFF",
    "idMode3": "b3OFF",
    
    "idSense4": "bOFF",
    "idSense3": "bOFF",
    "idSense2": "bOFF",
    "idSense1": "bOFF"
};

/* setAll array values to v */
function setAll(a, v) {
    var i, n = a.length;
    for (i = 0; i < n; ++i) {
        a[i] = v;
    }
};

function showButtons( isButtons ){
    var newSrc = "";

    for (isId in isButtons){
        if ( isId === "idCnts100" ){
            
            if ( isButtons[ isId ] ) {
                newSrc = "img/bCommaON.png";
            } else {
                newSrc = "img/bCommaOFF.png";
            }
            
        } else if ( isId === "idCnts200" ){
            
            if ( isButtons[ isId ] ) {
                newSrc = "img/bSemiON.png";
            } else {
                newSrc = "img/bSemiOFF.png";
            }
            
        } else {
            
            if ( isButtons[ isId ] ) {
                newSrc = "img/bON.png";
            } else {
                newSrc = "img/bOFF.png";
            }
        }

        putImage( isId, newSrc );

    }
};

function initContents( bValue ){
    if ( isDebug )
        console.log('initContents()');

    for (var isBtn in isContents){
        isContents[isBtn] = bValue;
    }

    if ( bValue ) {
        ContValue = 255;  // 377
        //setAll( isContents, true );
     } else {
        ContValue = 0;
        //setAll( isContents, false );
    }
};

function initAddress( bValue ){
    if ( isDebug )
        console.log('initAddress()');

    for (var isAdd in isAddress){
        isAddress[isAdd] = bValue;
    }

    if ( bValue ) {
        showButtons( isAddress );
    } else {
        AddrValue = 0;
        setAll( Addresses, 0 );  // clears all Addresses to zero value
    }
};

function initRegister( bValue ){
   if ( isDebug )
    console.log('initRegister()');

    for (var isReg in isControlRegs){
        isControlRegs[isReg] = bValue;
    }

    if ( bValue ) {
        showButtons( isControlRegs );
    } else {
        RegValue = 0;
        setAll( Registers, 0 );     // clears all Registers to zero value
    }
};

function initSenseSwitch(){
    if ( isDebug )
        console.log('initSenseSwitch()');

     for (var isSw in isSenseSwitch){
        isSenseSwitch[isSw] = false;
    }   
};


function initValues( bValue ){
    if ( isDebug )
        console.log('initValues()');

    initContents( bValue );
    showButtons( isContents );

    initAddress( bValue );
    showButtons( isAddress );

    initRegister( bValue );
    showButtons( isControlRegs );

    initSenseSwitch();
    showButtons( isSenseSwitch ); 
};

////// set button value section

function setContents( isContV10 ){
    if ( isDebug )
        console.log('setContents()');
    var isC10 = isContV10 + 256;      // ensure 8 bits ignore 9th bit
    var isC2 = isC10.toString(2);
    var isC1s = isC2.split("");

    for ( var i=1; i<9; i++){
        if ( isC1s[i] == 1 ) {
            isContents[ ix2Hcont[i] ] = true;
        } else {
            isContents[ ix2Hcont[i] ] = false;
        }
    }
};

function setAddress( isAddrV10 ){
    if ( isDebug )
        console.log('setAddress()');

    var isA10 = isAddrV10 + maxAddr;      // ensure 15 bits ignore 16th bit
    var isA2 = isA10.toString(2);
    var isA1s = isA2.split("");

    for ( var i=1; i<16; i++){
        if ( isA1s[i] == 1 ) {
            isAddress[ ix2Haddr[i] ] = true;
        } else {
            isAddress[ ix2Haddr[i] ] = false;
        }
    }
};

function setRegister( isRegV10 ){
    if ( isDebug )
        console.log('setRegister(isRegV10) '+isRegV10);

    var isR10 = isRegV10 + 16;      // ensure 4 bits ignore 5th bit
    var isR2 = isR10.toString(2);
    var isR1s = isR2.split("");

    if ( isDebug )
        console.log('isR1s='+isR1s);

    for ( var i=1; i<5; i++){
        if ( isR1s[i] == 1 ) {
            isControlRegs[ ix2Hctrl[i] ] = true;
        } else {
            isControlRegs[ ix2Hctrl[i] ] = false;
        }
    }
};



function putImage( imgId, newSrc ){
    var isId = "#"+imgId;
    $(isId).attr("src", newSrc);
};

function setImages( defaults ){
    var isID = "";
    var newSrc = "";
    for (isID in defaults) {
        newSrc = "img/"+defaults[isID]+".png";
        putImage(isID,newSrc);
    }
};

/* Process Display+Enter section */

function pDispAddrContent(){

    if ( isDebug )
        console.log('pDispAddrContent()');

    ContValue = Addresses[ AddrValue ];

    setRegister( RegValue );
    setAddress( AddrValue );
    setContents( ContValue );

    showButtons( isContents );
    showButtons( isAddress );
    showButtons( isControlRegs );

};

function pEnterAddrContent(){

    Addresses[ AddrValue ] = ContValue ;

    setRegister( RegValue );
    setAddress( AddrValue );
    setContents( ContValue );

    showButtons( isContents );
    showButtons( isAddress );
    showButtons( isControlRegs );

};

function pDispRegAddrContent(){

    AddrValue = Registers[ RegValue ];

    setRegister( RegValue );
    setAddress( AddrValue );

    showButtons( isAddress );
    showButtons( isControlRegs );

};

function pDispAddrPlus1(){

    if ( isDebug )
        console.log('pDispAddrPlus1()');

    AddrValue++;

    setAddress( AddrValue );
    showButtons( isAddress );

};

function pDispAddrMinus1(){

    AddrValue--;

    setAddress( AddrValue );
    showButtons( isAddress );

};

function pEnterRegAddr(){

    Registers[ RegValue ] = AddrValue ;

    setRegister( RegValue );
    setAddress( AddrValue );

    showButtons( isAddress );
    showButtons( isControlRegs );

};


/* AC ON/OFF */

function pACon(){
    powerON = true;   
    setImages( defineACon );
    initValues( false );
};

function pACoff(){
    setImages( defineACoff );
    initValues( false );
    powerON = false;
};


/* STOP and RUN section */
// using RELOAD to reset blinking... ;-) not working in Chrome but OK in FF


function pStop( butId, newSrc ){
    if ( ! powerON )
        return;
    if ( isDebug )
        console.log("pStop: "+butId+" "+newSrc);

    window.location.reload(true);  // reload from server NOT cache

};

function pInitRandomValues(){

    if (( ! powerON ) || ( isRunMode )) {  // do nothing on PowerOff or when testing memory
        return;
    }

// load Register 0 to 15 with address and content

    for ( var i=0; i<Registers.length; i++ ){   // 0 - 15
        Registers[i] = Math.floor(Math.random() * 32767 ); //  (Addresses.length - 1)
        Addresses[Registers[i]] = Math.floor(Math.random() * 255);   // 377 [Item word 421 421]
    }

// display random selected Register showing its address and content values

    RegValue = Math.floor(Math.random() * 15 ); // (Registers.length - 1)
    AddrValue = Registers[RegValue];
    ContValue = Addresses[AddrValue];

    setRegister( RegValue );
    setAddress( AddrValue );
    setContents( ContValue );

    showButtons( isContents );
    showButtons( isAddress );
    showButtons( isControlRegs );

};


/* flip from *ON.PNG to *OFF.PNG and visa versa */

function flipImage( imgId ){

    var isON = false;
    
    var isSrc = $("#"+imgId).attr("src");
    var newSrc = isSrc;
    if ( isSrc.slice(-5) == "N.png") {
        newSrc = isSrc.replace("N.png","FF.png");
        isON = false;
    }
    if ( isSrc.slice(-5) == "F.png") {
        newSrc = isSrc.replace("FF.png","N.png");
        isON = true;
    }  
    putImage( imgId, newSrc )
    
    return( isON );
};


/* process CLEAR buttons */

/* on MouseDown show all 1s */

function pShow1s( butId ){
    if ( isDebug )
        console.log('pShow1s()');

    if (( ! powerON ) || ( isRunMode )) {  // do nothing on PowerOff or when testing memory
        return ;
    }

    var isBool = flipImage( butId );
    if ( butId == "idCntsClear" ){
        initContents( true );
        showButtons( isContents );
    } else
    if ( butId == "idAddrClear" ){
        var SaveAddrContentvar = new Array(maxAddr);
        SaveAddrContent = Addresses.slice(); // clear only display not the address values
        initAddress( true );
        showButtons( isAddress );
        Addresses = SaveAddrContent.slice();
    } else
    {
        initValues( true ); // System Clear resets Content, Address & Reg values to 1s
    }
};

/* on MouseUp show all 0s */

function pClear( butId ){
    if ( isDebug )
        console.log('pClear()');

    if (( ! powerON ) || ( isRunMode )) {  // do nothing on PowerOff or when testing memory
        return ;
    }

    var isBool = flipImage( butId );
    if ( butId == "idCntsClear" ){
        initContents( false );
        showButtons( isContents );
    } else
    if ( butId == "idAddrClear" ){
        var SaveAddrContentvar = new Array(maxAddr);
        SaveAddrContent = Addresses.slice(); // clear only display not the address values
        initAddress( false );
        showButtons( isAddress );
        Addresses = SaveAddrContent.slice();
    } else
    {
        initValues( false ); // System Clear resets Content, Address & Reg values to 0s
    }
};


/* process CONTENTS buttons */

function pContents( imgId ){

    if (( ! powerON ) || ( isRunMode )) {  // do nothing on PowerOff or when testing memory
        return ;
    }

    isContents[ imgId ] = flipImage( imgId );
    ContValue = decimalButtons( isContents, "idCnts" );
    if ( isDebug )
        console.log( "Contents= "+ContValue );
};

/* process ADDRESS buttons */

function pAddr( imgId ){

    if (( ! powerON ) || ( isRunMode )) {  // do nothing on PowerOff or when testing memory
        return ;
    }

    isAddress[ imgId ] = flipImage( imgId );
    AddrValue = decimalButtons( isAddress, "idAddr" );
    if ( isDebug )
        console.log( "Address= "+AddrValue );
};

/* process CONTROL Register buttons */

function pControl( imgId ){

    if (( ! powerON ) || ( isRunMode )) {  // do nothing on PowerOff or when testing memory
        return ;
    }

    isControlRegs[ imgId ] = flipImage( imgId );
    RegValue = decimalButtons( isControlRegs, "idCReg" );
    if ( isDebug )
        console.log( "Registers= "+RegValue );
};

/* get js Rev date+time */

function pSetRev() {

var d = new Date();
var YY = d.getFullYear();
var MM = d.getMonth()+1;
    if ( MM < 10 ) MM = "0"+MM;
var DD = d.getDate();
    if ( DD < 10 ) DD = "0"+DD;
var HH = d.getHours();
    if ( HH < 10 ) HH = "0"+HH;
var Mts = d.getMinutes();
    if ( Mts < 10 ) Mts = "0"+Mts;

var isRevision = "JS kds: " + YY + MM + DD + "-" + HH + Mts;

    if ( isDebug )
        console.log( isRevision );

    return isRevision;

};

/* process SENSE switches */

function pSense( imgId ){

    if (( ! powerON ) || ( isRunMode )) {  // do nothing on PowerOff or when testing memory
        return ;
    }

    isSenseSwitch[ imgId ] = flipImage( imgId );

    // update octal / decimal values for possible info display

    var ContValue8 = ContValue.toString(8);
    var AddrValue8 = AddrValue.toString(8);
    var RegValue8  = RegValue.toString(8);

    var isJSRev = pSetRev();

    $("#revision").text( isJSRev );

    $("#ContentsOctalValue").text(ContValue8);
    $("#ContentsDecimalValue").text(ContValue);

    $("#AddressOctalValue").text(AddrValue8);
    $("#AddressDecimalValue").text(AddrValue);

    $("#ControlOctalValue").text(RegValue8);
    $("#ControlDecimalValue").text(RegValue);

    
    if ( isSenseSwitch[ "idSense4" ] ) {
        $("#infoSection").attr("style","visibility: visible");
    } else {
        $("#infoSection").attr("style","visibility: hidden");
    }
    
    if ( isSenseSwitch[ "idSense3" ] ) {
        isDebug = true;
    } else {
        isDebug = false;
    }
};


/* MODE2 and MODE3 */

function pMode2(){

    if (( ! powerON ) || ( isRunMode )) {  // do nothing on PowerOff or when testing memory
        return ;
    }

    flipImage( "idMode2" );
    flipImage( "idMode3" );
};
    
function pMode3(){

    if (( ! powerON ) || ( isRunMode )) {  // do nothing on PowerOff or when testing memory
        return ;
    }

    flipImage( "idMode3" );
    flipImage( "idMode2" );
};

/* Info section */
function infoMode4(){
    alert("Inactive Button: Mode4 Address is only available from H1200 on up.");
};

function infoBigger77777(){
    alert("Inactive Button: H200 is limited to address 77777 octal ("+maxAddr+") bytes.");
};

function showInfo( butId ){
    switch ( butId ) {
        case "idSense4":
            $("#infoSense").text("Show H200 Info Section."); 
            $("#infoSense").attr("style","display: block");
            break;
        case "idSense3":
            $("#infoSense").text("Debug Mode."); 
            $("#infoSense").attr("style","display: block");
            break;
        case "idSense2":
            $("#infoSense").text("[Run] what?");
            $("#infoSense").attr("style","display: block");  
            break;
        case "idSense1":
            $("#infoSense").text("[Run] Test Memory");
            $("#infoSense").attr("style","display: block");  
            break;
    }
};

function clearInfo( butId ){
    $("#infoSense").attr("style","display: none");
};


function pSwitchOFF( idSw ) {

        if ( isSenseSwitch[ idSw ] ) {
             isSenseSwitch[ idSw ] = flipImage( idSw );
        }
};


function pRun( butId, newSrc ){

    if (( ! powerON ) || ( isRunMode )) {  // do nothing on PowerOff or when testing memory
        return ;
    }

    if ( isDebug )
        console.log("pRun: "+butId+" "+newSrc);

    /* show RUN button ON */
    putImage( butId, newSrc );

    /* also show STOP button OFF */
    stopON = false;
    putImage( "idStop", "img/bRedOFF.png" );

    if ( isSenseSwitch["idSense1"] && isSenseSwitch["idSense2"] ) {
        /* end in STOP mode */
        pStop( "idStop", "img/bRedON.png" );
        return;
    }

    /* test memory -- turns switch ON/OFF */
    if ( isSenseSwitch["idSense1"] ) {
        runTestMemory();
        pSwitchOFF( "idSense1" );

    } else if ( isSenseSwitch["idSense2"] ) {
        runClearMemory();
        pSwitchOFF( "idSense2" );
    }

    stopON = true;

    // need to push STOP button to reset page to original NONE blinking class
    // otherwise button blinking continues with red STOP light ON

    // putImage( "idStop", "img/bRedON.png" );

};


// - clear memory - clear memory - clear memory - clear memory - clear memory

function sleep(milliseconds){
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
         }
     }
};


function runTestMemory() { // sense 1

    isRunMode = true;

    var limit = 32767; // all buttons ON = 32767

    AddrValue = limit;
    ContValue = 255;  // all buttons ON = 255

    setAddress( AddrValue );
    setContents( ContValue );
    blinkButtons(); // set blink class on all content & address buttons
    showButtons( isContents );
    showButtons( isAddress );

    // isRunMode = false;
    // isRunMode must stay true until STOP is pushed
};

function blinkButtons() {

    var isClass = "";

    for (isId in isBlinkMap) {
        isClass = isBlinkMap[ isId ];
        $(isId).removeClass().addClass( isClass );
    }

};

//    if ( isDebug ) { console.log("pRun: idSense2=runTestMemory"); }

function runClearMemory() { // sense 2
};



