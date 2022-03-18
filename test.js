var json = require('./data/bordle.json');

json.sort();

console.dir(JSON.stringify([... new Set(json)]));
