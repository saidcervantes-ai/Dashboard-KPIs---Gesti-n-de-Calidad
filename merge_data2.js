const fs = require('fs');

let srcHead = fs.readFileSync('dashboard_data_HEAD_backup.js', 'utf8');
srcHead = srcHead.replace('const ticketsData', 'var ticketsDataHead');
eval(srcHead);

let srcNew = fs.readFileSync('dashboard_data.js', 'utf8');
srcNew = srcNew.replace('const ticketsData', 'var ticketsDataNew');
eval(srcNew);

const historicos = ticketsDataHead.filter(t => parseInt(t.sprint) >= 30 && parseInt(t.sprint) <= 34);
console.log('Historicos S30-S34:', historicos.length);

const byH = {};
historicos.forEach(t => { byH[t.sprint] = (byH[t.sprint] || 0) + 1; });
console.log('Por sprint:', JSON.stringify(byH));

const combined = historicos.concat(ticketsDataNew);
console.log('Total combinado:', combined.length);

function esc(v) { return String(v || '').replace(/"/g, "'").replace(/\n/g, ' ').replace(/\r/g, ''); }

const lines = combined.map(t =>
  '  {clave: "' + esc(t.clave) + '", tipoIncidencia: "' + esc(t.tipoIncidencia) + '", resumen: "' + esc(t.resumen) + '", asignado: "' + esc(t.asignado) + '", prioridad: "' + esc(t.prioridad) + '", estado: "' + esc(t.estado) + '", estadoNormalizado: "' + esc(t.estadoNormalizado) + '", creada: "' + esc(t.creada) + '", actualizada: "' + esc(t.actualizada) + '", resuelta: "' + esc(t.resuelta) + '", sprint: "' + esc(t.sprint) + '", sprints: "' + esc(t.sprints) + '", diasResolucionReal: "' + esc(t.diasResolucionReal) + '", storyPointEstimate: "' + esc(t.storyPointEstimate) + '", desviacion: "' + esc(t.desviacion) + '"}'
);

const out = '// Dashboard Data - Sprint 30-37\nconst ticketsData = [\n' + lines.join(',\n') + '\n];';
fs.writeFileSync('dashboard_data.js', out, {encoding:'utf8'});
console.log('DONE');

const bySprint = {};
combined.forEach(t => { bySprint[t.sprint] = (bySprint[t.sprint] || 0) + 1; });
console.log('Distribucion:', JSON.stringify(bySprint));
