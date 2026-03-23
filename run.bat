@echo off
nodemon index.js
@REM pm2 start index.js --name node-server
@REM pm2 monit
@REM pm2 stop node-server
@REM pm2 stop all
@REM pm2 kill
pause