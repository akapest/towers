Towers
======

Web app for telecom based on yandex maps, playframework and backbone.

Dependencies
-----
Python2
PlayFramework (uses Python)
Node.js for packaging 


Install PlayFramework
-----
Download from http://downloads.typesafe.com/play/1.2.7/play-1.2.7.zip
Add './play' command to your system path or use relative path to it. 


Run
-------
 * `npm install && gulp` build client and start watching over files 
 * `play deps && play run` 
 * Open app at http://localhost:9000

 
Directory structure
------- 
Client
index.html - /app/views/Application/index.html
html src   - /app/views/templates
js src     - /client
styles     - /css
build      - /build
/fonts

Server
/app
/conf
/lib
/modules
/test
/tmp
    
