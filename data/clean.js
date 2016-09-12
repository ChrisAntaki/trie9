const fs = require('fs');

const data = fs.readFileSync(process.argv[2], 'utf-8').trim();
const names = data.split('\n').map(line => line.split(' ')[0].toLowerCase());
fs.writeFileSync(process.argv[2], names.join('\n'));
