@echo off
echo Starting AYUMANTHRA Backend Server...
echo ======================================

npm install
npm run seed
npm run dev

pause