/**
 * ANÁLISIS CRÍTICO DEL CHANGELOG IMS-1078
 * Verificar si los datos son correctos o hay discrepancia
 */

const fs = require('fs');

// Cargar changelog
const changelogContent = fs.readFileSync('./dashboard_changelog_data.js', 'utf8');
const changelogMatch = changelogContent.match(/const changelogData = ({[\s\S]*});/);
const changelogData = eval('(' + changelogMatch[1] + ')');

// Función para parsear fecha
function parseFecha(fechaStr) {
    // Formato: "10/03/2026 11:28"
    const partes = fechaStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
    if (!partes) return null;
    const [, dia, mes, año, hora, minuto] = partes;
    return new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia), parseInt(hora), parseInt(minuto));
}

// Función para calcular días entre dos fechas (días calendario, no laborales)
function calcularDiasCalendario(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) return null;
    const diff = fechaFin - fechaInicio;
    return diff / (1000 * 60 * 60 * 24);
}

// Función para calcular días laborales (9h/día)
function calcularDiasLaborales(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) return null;
    const diffMs = fechaFin - fechaInicio;
    return diffMs / (1000 * 60 * 60 * 9);
}

console.log('\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║            ANÁLISIS CRÍTICO: CHANGELOG IMS-1078                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

const ticket = 'IMS-1078';
const changelog = changelogData[ticket];

console.log('📜 CHANGELOG ALMACENADO EN ARCHIVO:');
console.log('─'.repeat(70));

changelog.forEach((entry, idx) => {
    console.log(`\n[${idx + 1}] Estado: ${entry.estado}`);
    console.log(`    Inicio:     ${entry.inicio}`);
    console.log(`    Fin:        ${entry.fin}`);
    console.log(`    Días (en archivo): ${entry.dias}`);
});

console.log('\n\n📊 VERIFICACIÓN DE CÁLCULOS:');
console.log('─'.repeat(70));

// Enfocarse en CODE REVIEW
const codeReviewEntry = changelog[4]; // El último es CODE REVIEW

console.log(`\n🔍 ANALIZANDO: ${codeReviewEntry.estado}`);
console.log(`   Inicio: ${codeReviewEntry.inicio}`);
console.log(`   Fin:    ${codeReviewEntry.fin}`);
console.log(`   Días registrados en archivo: ${codeReviewEntry.dias}`);

const fechaInicio = parseFecha(codeReviewEntry.inicio);
const fechaFin = codeReviewEntry.fin === 'En curso' 
    ? new Date('2026-03-23T12:00:00') // Fecha de hoy según el contexto
    : parseFecha(codeReviewEntry.fin);

console.log(`\n   Fecha inicio (parseada): ${fechaInicio}`);
console.log(`   Fecha fin (parseada):    ${fechaFin}`);

if (fechaInicio && fechaFin) {
    const diasCalendario = calcularDiasCalendario(fechaInicio, fechaFin);
    const diasLaborales = calcularDiasLaborales(fechaInicio, fechaFin);
    
    console.log(`\n   📐 CÁLCULO MANUAL:`);
    console.log(`      Días CALENDARIO: ${diasCalendario.toFixed(2)}`);
    console.log(`      Días LABORALES (9h/día): ${diasLaborales.toFixed(2)}`);
    console.log(`      Días en archivo: ${codeReviewEntry.dias}`);
    
    console.log(`\n   ⚠️  ANÁLISIS:`);
    if (Math.abs(diasLaborales - codeReviewEntry.dias) < 0.5) {
        console.log(`      ✅ El valor ${codeReviewEntry.dias} coincide con cálculo laboral`);
        console.log(`      El archivo parece estar CORRECTO`);
    } else if (Math.abs(diasCalendario - codeReviewEntry.dias) < 0.5) {
        console.log(`      ⚠️  El valor ${codeReviewEntry.dias} coincide con días calendario`);
        console.log(`      Parece que se usan días calendario, NO laborales`);
    } else {
        console.log(`      ❌ El valor ${codeReviewEntry.dias} NO coincide con ningún cálculo`);
        console.log(`      DISCREPANCIA DETECTADA`);
    }
}

// Ahora verificar qué dice el usuario en JIRA
console.log(`\n\n👤 VERIFICACIÓN CON DATO DEL USUARIO:`);
console.log('─'.repeat(70));

console.log(`\nUsted reporta (verificado en JIRA):`);
console.log(`   Entrada a CODE REVIEW:  10 de marzo`);
console.log(`   Salida de CODE REVIEW:  23 de marzo`);
console.log(`   Duración: ~13 días (según JIRA)`);

console.log(`\nEn el archivo:`) ;
console.log(`   Entrada: 10/03/2026 11:28`);
console.log(`   Salida: ${codeReviewEntry.fin}`);
console.log(`   Duración: ${codeReviewEntry.dias} días`);

// Calcular qué debería ser 13 días
const fechaJiraInicio = new Date(2026, 2, 10, 11, 28); // 10 de marzo 11:28
const fechaJiraFin = new Date(2026, 2, 23, 12, 0);     // 23 de marzo mediodía
const diasJiraCalendario = calcularDiasCalendario(fechaJiraInicio, fechaJiraFin);
const diasJiraLaborales = calcularDiasLaborales(fechaJiraInicio, fechaJiraFin);

console.log(`\nSi fuera del 10/03 11:28 al 23/03 (mediodía):`);
console.log(`   Días CALENDARIO: ${diasJiraCalendario.toFixed(2)}`);
console.log(`   Días LABORALES: ${diasJiraLaborales.toFixed(2)}`);

console.log(`\n\n🎯 CONCLUSIÓN:`);
console.log('─'.repeat(70));

if (codeReviewEntry.fin === 'En curso') {
    console.log(`\n⚠️  ESTADO CRÍTICO: El archivo dice fin='En curso'`);
    console.log(`    Esto significa que según el archivo, IMS-1078 AÚN SIGUE en CODE REVIEW`);
    console.log(`    (no ha transicionado a otro estado).`);
    console.log(`\n    Si es verdad que pasó a TEST el 23/03, entonces:`);
    console.log(`    - El changelog está DESACTUALIZADO`);
    console.log(`    - Necesita extraer datos frescos de JIRA`);
    console.log(`    - El valor de 4.7 días pudo haber sido correcto en su momento`);
    console.log(`      (si salió de CODE REVIEW antes del 23/03)`);
} else {
    console.log(`\n✅ El archivo tiene fin='${codeReviewEntry.fin}'`);
    console.log(`   Esto sugiere que SÍ salió de CODE REVIEW.`);
}

console.log('\n\n📋 RECOMENDACIÓN:');
console.log('─'.repeat(70));
console.log(`\nPara resolver esto definitivamente, necesitamos:`)
console.log(`1. Verificar en JIRA: ¿Cuándo exactamente salió de CODE REVIEW?`);
console.log(`2. ¿A qué estado pasó después de CODE REVIEW?`);
console.log(`3. Si fin='En curso' en el archivo, significa que aún está en CODE REVIEW`);
console.log(`   según los datos almacenados (que podrían estar DESACTUALIZADOS)`);
