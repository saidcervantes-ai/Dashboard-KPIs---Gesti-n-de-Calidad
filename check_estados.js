// sprint state breakdown
const fs = require('fs');
const content = fs.readFileSync('dashboard_data.js', 'utf8');
const lines = content.split('\n');
const ticketLines = lines.filter(l => l.trim().startsWith('{clave:'));

const parse = (line) => {
    const get = (key) => { const m = line.match(new RegExp(key + ': "([^"]*)"')); return m ? m[1] : ''; };
    return { clave: get('clave'), estado: get('estado'), sprint: get('sprint') };
};

const tickets = ticketLines.map(parse);
const s35 = tickets.filter(t => t.sprint === '35');
const s36 = tickets.filter(t => t.sprint === '36');
const s37claves = new Set(tickets.filter(t => t.sprint === '37').map(t => t.clave));

const arrastS35 = s35.filter(t => t.estado === 'Arrastrado');
const arrastS36 = s36.filter(t => t.estado === 'Arrastrado');

console.log(`S35 Arrastrado: ${arrastS35.length}`);
console.log(`  En S37: ${arrastS35.filter(t => s37claves.has(t.clave)).length}`);
const noS37_35 = arrastS35.filter(t => !s37claves.has(t.clave));
console.log(`  NO en S37: ${noS37_35.length}`);
if (noS37_35.length) console.log('  Claves:', noS37_35.map(t=>t.clave).join(', '));

console.log(`\nS36 Arrastrado: ${arrastS36.length}`);
console.log(`  En S37: ${arrastS36.filter(t => s37claves.has(t.clave)).length}`);
const noS37_36 = arrastS36.filter(t => !s37claves.has(t.clave));
console.log(`  NO en S37: ${noS37_36.length}`);
if (noS37_36.length) console.log('  Claves:', noS37_36.map(t=>t.clave).join(', '));

// Where are the 22 S35-arrastrado not in S37?
const noS37_35_claves = new Set(noS37_35.map(t=>t.clave));
const enS36 = tickets.filter(t => t.sprint==='36' && noS37_35_claves.has(t.clave));
console.log(`\nLos 22 de S35-Arrastrado NO en S37, en S36:`);
const cnt36 = {}; enS36.forEach(t=>{cnt36[t.estado]=(cnt36[t.estado]||0)+1;});
Object.entries(cnt36).forEach(([k,v])=>console.log(`  ${k}: ${v}`));

console.log(`\nResumen:`);
console.log(`S35 total=${s35.length} | Finalizados en S35=${s35.filter(t=>t.estado==='Finalizados').length} | Arrastrados a S36 y finalizados ahí=${enS36.filter(t=>t.estado==='Finalizados').length} | Arrastrados a S37=${arrastS35.filter(t=>s37claves.has(t.clave)).length}`);
console.log(`S36 total=${s36.length} | Finalizados en S36=${s36.filter(t=>t.estado==='Finalizados').length} | Arrastrados a S37=${arrastS36.length} (todos en S37)`);
console.log(`S37 total: ${tickets.filter(t=>t.sprint==='37').length}`);
