const fs = require('fs');
const dataContent = fs.readFileSync('dashboard_data.js', 'utf8');
const changelogContent = fs.readFileSync('dashboard_changelog_data.js', 'utf8');

const ticketsMatch = dataContent.match(/const ticketsData\s*=\s*(\[[\s\S]*?\]);/);
const tickets = eval(ticketsMatch[1]);
const s36arr = tickets.filter(x => x.sprint === '36' && x.estado === 'Arrastrado');

const clavePattern = /"(IMS-\d+)"\s*:/g;
const claves = new Set();
let m;
while ((m = clavePattern.exec(changelogContent)) !== null) claves.add(m[1]);

console.log('Total arrastrados S36:', s36arr.length);
s36arr.forEach(t => {
  const enChangelog = claves.has(t.clave);
  console.log(t.clave, '-', (t.asignado || 'Sin asignar').padEnd(30), '- en changelog:', enChangelog);
});
