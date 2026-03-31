const fs = require('fs');
const c = fs.readFileSync('dashboard_data.js','utf8');
const lines = c.split('\n').filter(l => l.trim().startsWith('{clave:'));
const get = (l, k) => { const m = l.match(new RegExp(k + ': "([^"]*)"')); return m ? m[1] : ''; };
const tickets = lines.map(l => ({ clave: get(l,'clave'), sprint: get(l,'sprint'), estado: get(l,'estado') }));

['35','36','37'].forEach(sp => {
    const t   = tickets.filter(x => x.sprint === sp);
    const arr = t.filter(x => x.estado === 'Arrastrado');
    const fin = t.filter(x => x.estado === 'Finalizados');
    const otros = t.filter(x => x.estado !== 'Arrastrado' && x.estado !== 'Finalizados');
    const uniqOtros = [...new Set(otros.map(x => x.estado))].join(', ');
    console.log(`S${sp}: total=${t.length} | Finalizados=${fin.length} | Arrastrado=${arr.length} | otros=${otros.length} (${uniqOtros||'-'})`);
    console.log(`  → sin Arrastrado (para Rework): ${t.length - arr.length}`);
});
