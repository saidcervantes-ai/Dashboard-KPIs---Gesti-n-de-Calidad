const fs = require('fs');
let content = fs.readFileSync('./dashboard_data.js', 'utf8');

// Estos 5 tickets S36 fueron cambiados de Arrastrado a En curso incorrectamente
const revertir = ['IMS-1164', 'IMS-1146', 'IMS-1116', 'IMS-1174', 'IMS-1148'];

revertir.forEach(k => {
    const idx = content.indexOf('clave: "' + k + '"');
    if (idx === -1) { console.log('No encontrado:', k); return; }
    const end = content.indexOf('},', idx);
    const old = content.substring(idx, end);
    let nuevo = old.replace(/estadoNormalizado: "En curso"/, 'estadoNormalizado: "Arrastrado"');
    nuevo = nuevo.replace(/estado: "En curso"/, 'estado: "Arrastrado"');
    if (old !== nuevo) {
        content = content.replace(old, nuevo);
        console.log('Revertido:', k);
    } else {
        console.log('Sin cambio:', k);
    }
});

fs.writeFileSync('./dashboard_data.js', content, 'utf8');

// Verificar
const fn = new Function(content + '\nreturn ticketsData;');
const t = fn();
const s36 = t.filter(x => x.sprint === '36');
const pe36 = {};
s36.forEach(x => { pe36[x.estadoNormalizado] = (pe36[x.estadoNormalizado] || 0) + 1; });
console.log('\nS36 estados:', JSON.stringify(pe36));

const s35 = t.filter(x => x.sprint === '35');
const pe35 = {};
s35.forEach(x => { pe35[x.estadoNormalizado] = (pe35[x.estadoNormalizado] || 0) + 1; });
console.log('S35 estados:', JSON.stringify(pe35));
