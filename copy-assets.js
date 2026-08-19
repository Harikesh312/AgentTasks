const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\rawat\\.gemini\\antigravity-ide\\brain\\020987cf-483d-48a8-ad83-40d2c9e52ac6\\header_illustration_1787158665406.jpg';
const dest = path.join(__dirname, 'frontend', 'public', 'images', 'header_illustration.jpg');

fs.copyFileSync(src, dest);
console.log('Copied header illustration successfully!');
