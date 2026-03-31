/*
 * Script de verificación local (no usado por el dashboard).
 * Ejecutar: node dev_validate_cycle_time.js
 */

const fs = require('fs');
const vm = require('vm');

function loadIntoContext(ctx, filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  vm.runInContext(code, ctx, { filename: filePath });
}

function exportFromContext(ctx, expr, exportName) {
  vm.runInContext(`this[${JSON.stringify(exportName)}] = (${expr});`, ctx);
}

function main() {
  const ctx = {
    console,
    window: {
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    document: {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      createElement: () => ({ style: {}, appendChild: () => {} }),
      body: { appendChild: () => {} },
    },
  };
  vm.createContext(ctx);

  loadIntoContext(ctx, './dashboard_changelog_data.js');
  exportFromContext(ctx, 'changelogData', '__changelogData');

  loadIntoContext(ctx, './dashboard_data.js');
  exportFromContext(ctx, 'ticketsData', '__ticketsData');

  loadIntoContext(ctx, './dashboard_kpis_avanzados.js');
  exportFromContext(ctx, 'calcularCycleTime', '__calcularCycleTime');

  ctx.changelogData = ctx.__changelogData;

  const tickets = ctx.__ticketsData;
  const calcularCycleTime = ctx.__calcularCycleTime;

  const res = calcularCycleTime(tickets, ['36']);
  const det = res.ticketsDetalle.find(t => t.clave === 'IMS-1176');

  console.log({ promedio: res.promedio, total: res.total });
  if (!det) {
    console.log('IMS-1176 no aparece en ticketsDetalle');
    return;
  }

  const etapasMins = Object.fromEntries(
    Object.entries(det.etapas).map(([k, v]) => [k, Math.round(v * 540)])
  );

  console.log({
    clave: det.clave,
    sprint: det.sprint,
    diasTotal: det.diasTotal,
    etapasMins,
  });
}

main();
