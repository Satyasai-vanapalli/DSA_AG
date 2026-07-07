const fs = require('fs');
const data = JSON.parse(fs.readFileSync('java-curriculum.json', 'utf8'));
const names = [];
function getNames(nodes) {
  for (const n of nodes) {
    names.push(n.name);
    if (n.subTopics) getNames(n.subTopics);
  }
}
getNames(data);
const counts = {};
for (const n of names) {
  counts[n] = (counts[n] || 0) + 1;
}
for (const [name, count] of Object.entries(counts)) {
  if (count > 1) console.log(`DUPLICATE: ${name} (${count} times)`);
}
