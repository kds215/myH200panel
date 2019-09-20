# myH200panel
<img src="https://github.com/kds215/myH200panel/blob/master/docs/H200TestRun.jpg" alt="myH200panel" />

Honeywell 200 Control Panel Simulation in HTML-Javascript.

Download dirs and load H200.htm in Chrome, FireFox or Safari, no need for web server environment.
The docs directory is the largest with 30Mb, it holds pdfs of old manuals and is not needed at runtime.
All files are roughly 500k without the docs directory.

The H200 console was the operator control panel to display H200 system status
and allowing for human operator interaction with system operations.

The H200 control panel was an integral part of the central processor,
containing control buttons for human operators to stop/start/load/interrogate
program instructions. The Honeywell H200 series was introducted 1962 and 
superseded in 1972 with the H2000 series. The H200 system main memory speed 
was 2 microseconds per character (byte) with a 65K max memory capacity.

This simple javascript-html-based Honeywell H200 control panel simulator emulates
flickering lights while pretending to run Clear-Memory program on the H200 console.

The Clear-Memory-Run effect is launched when setting Sense Switch#1 and pushing the RUN button,
and ends when hitting the STOP button to reset the H200 panel.

Users can access individual octal addresses, deposit octal byte code into content with
item and/or word marks and deposit this content at a selected address.
Addresses can be deposited/recalled into 15 (17octal) registers.

CLEAR buttons work as advertised, BOOTstrap and INSTR are NOPs (NoOperation) for now.
The INITialize! button, normally used to clear registers before any BOOTstrap,
is now used to randomly initialize registers and addresses with random content.
The ADDRess MODE (2+3) has no effect as no Easycoder program is actually running.

Sense Switch#1 ON & RUN button triggers Clear-Memory button flashing effect.
Sense Switch#2 NOP.
Sense Switch#3 ON logs runtime comments to javascript console.
Sense Switch#4 ON shows info section with table of octal/decimal display values.



