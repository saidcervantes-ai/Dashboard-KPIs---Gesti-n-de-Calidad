const fs = require('fs');
const code = fs.readFileSync('dashboard_data.js', 'utf8').replace('const ticketsData', 'ticketsData');
global.ticketsData = undefined; eval(code);

const sprints = ['31','32','33','34','35','36'];
console.log('Sprint | Total | ConSP | SinSP | SP-Bugs | SP-Tasks | SP-HU | Cobertura');
sprints.forEach(s => {
    const t = ticketsData.filter(x => String(x.sprint||'').trim() === s);
    const hasSP = x => x.storyPointEstimate !== '' && x.storyPointEstimate != null && !isNaN(parseFloat(x.storyPointEstimate));
    const conSP = t.filter(hasSP);
    const sinSP = t.length - conSP.length;
    const sum = (arr) => arr.reduce((acc, x) => acc + parseFloat(x.storyPointEstimate), 0);
    const spBugs  = sum(conSP.filter(x => x.tipoIncidencia === 'Error'));
    const spTasks = sum(conSP.filter(x => x.tipoIncidencia === 'Tarea'));
    const spHU    = sum(conSP.filter(x => x.tipoIncidencia === 'Historia'));
    const pct = t.length ? ((conSP.length/t.length)*100).toFixed(0)+'%' : '0%';
    console.log('Sprint '+s+' | '+t.length+' tickets | '+conSP.length+' con SP | '+sinSP+' sin SP | Bugs:'+spBugs.toFixed(1)+' | Tasks:'+spTasks.toFixed(1)+' | HU:'+spHU.toFixed(1)+' | '+pct);
});
