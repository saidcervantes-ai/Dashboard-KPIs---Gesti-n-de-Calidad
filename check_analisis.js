const fs = require('fs');
const c = fs.readFileSync('dashboard_data.js','utf8');
const lines = c.split('\n').filter(l => l.trim().startsWith('{clave:'));
const get = (l, k) => { const m = l.match(new RegExp(k + ': "([^"]*)"')); return m ? m[1] : ''; };
const tickets = lines.map(l => ({
    clave: get(l,'clave'),
    sprint: get(l,'sprint'),
    estado: get(l,'estado'),
    tipo: get(l,'tipoIncidencia'),
    sp: get(l,'storyPointEstimate')
}));

['35','36','37'].forEach(sp => {
    const tAll  = tickets.filter(x => x.sprint === sp);
    const tConArrastrado = tAll; // lo que usa el dashboard HOY
    const t = tickets.filter(x => x.sprint === sp && x.estado !== 'Arrastrado'); // correcto

    // Count all unique ticket types
    const tipoCount = {};
    t.forEach(x => { tipoCount[x.tipo] = (tipoCount[x.tipo]||0)+1; });

    // Current bug detection logic
    const bugs = t.filter(x => {
        const tipo = (x.tipo||'').toLowerCase();
        return tipo.includes('bug') || tipo.includes('error') || tipo === 'defect';
    });
    const tasks = t.filter(x => {
        const tipo = (x.tipo||'').toLowerCase();
        return tipo.includes('task') || tipo.includes('tarea');
    });
    const stories = t.filter(x => {
        const tipo = (x.tipo||'').toLowerCase();
        return tipo.includes('story') || tipo.includes('historia');
    });
    const epics = t.filter(x => {
        const tipo = (x.tipo||'').toLowerCase();
        return tipo.includes('epic') || tipo.includes('spike') || tipo.includes('subtarea');
    });
    // After excluding epics/subtareas, what's "ticketsReales" ?
    const reales = t.filter(x => {
        const tipo = (x.tipo||'').toLowerCase();
        return !tipo.includes('epic') && !tipo.includes('spike') && !tipo.includes('subtarea');
    });
    const bugsEnReales = reales.filter(x => {
        const tipo = (x.tipo||'').toLowerCase();
        return tipo.includes('bug') || tipo.includes('error') || tipo === 'defect';
    });
    const funcEnReales = reales.filter(x => {
        const tipo = (x.tipo||'').toLowerCase();
        return tipo.includes('task') || tipo.includes('tarea') || tipo.includes('story') || tipo.includes('historia');
    });
    const otrosReales = reales.filter(x => !bugsEnReales.includes(x) && !funcEnReales.includes(x));

    // SP breakdown
    const getSP = x => parseFloat(x.sp)||0;
    const bugsSP = bugsEnReales.reduce((s,x)=>s+getSP(x),0);
    const funcSP = funcEnReales.reduce((s,x)=>s+getSP(x),0);
    const otrosSP = otrosReales.reduce((s,x)=>s+getSP(x),0);
    const totalSP = bugsSP+funcSP+otrosSP;

    console.log(`\n=== SPRINT ${sp} ===`);
    console.log(`Total (sin Arrastrado): ${t.length}`);
    console.log(`  Excluidos (epic/spike/subtarea): ${epics.length}`);
    console.log(`  ticketsReales: ${reales.length}`);
    console.log(`\nTipos presentes en ticketsReales:`);
    const realTipos = {};
    reales.forEach(x => { realTipos[x.tipo] = (realTipos[x.tipo]||0)+1; });
    Object.entries(realTipos).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`  "${k}": ${v}`));
    console.log(`\nClasificación actual:`);
    console.log(`  bugs (contienen "bug"/"error"): ${bugsEnReales.length}  → ${totalSP>0?((bugsSP/totalSP)*100).toFixed(1):0}% SP`);
    console.log(`  funcionalidades (task/tarea/story/historia): ${funcEnReales.length}`);
    console.log(`  otros (sin clasificar): ${otrosReales.length}`);
    if(otrosReales.length) console.log(`    tipos otros: ${[...new Set(otrosReales.map(x=>x.tipo))].join(', ')}`);
    console.log(`\nSP breakdown:`);
    console.log(`  bugsSP=${bugsSP} funcSP=${funcSP} otrosSP=${otrosSP} totalSP=${totalSP}`);
    console.log(`  % bugs SP = ${totalSP>0?((bugsSP/totalSP)*100).toFixed(1):0}%`);
    console.log(`  % func SP = ${totalSP>0?((funcSP/totalSP)*100).toFixed(1):0}%`);
});
