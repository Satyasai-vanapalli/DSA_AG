const fs = require('fs');
const data = JSON.parse(fs.readFileSync('java-curriculum.json', 'utf8'));
const lengths = [];
function getLengths(nodes) {
  for (const n of nodes) {
    lengths.push(n.name.length);
    if (n.subTopics) getLengths(n.subTopics);
  }
}
getLengths(data);
console.log('Max length:', Math.max(...lengths));
