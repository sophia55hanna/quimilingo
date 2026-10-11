import { allLessons, modules } from '../src/data/chemistryData';

const errors: string[] = [];
let questionCount = 0;
const counts: Record<string, number> = {};

for (const m of modules) {
  if (m.lessons.length < 2) errors.push(`${m.id}: menos de 2 lições`);
}
for (const { lesson } of allLessons) {
  const n = lesson.questions.length;
  if (n < 5 || n > 8) errors.push(`${lesson.id}: ${n} questões (esperado 5–8)`);
  for (const q of lesson.questions) {
    questionCount++;
    counts[q.type] = (counts[q.type] ?? 0) + 1;
    const dollars = (JSON.stringify(q).match(/\$/g) ?? []).length;
    if (dollars % 2 !== 0) errors.push(`${q.id}: '$' desbalanceado`);
    if (q.type === 'multiple-choice') {
      if (q.options.length !== 4) errors.push(`${q.id}: ${q.options.length} alternativas`);
      if (q.correctIndex < 0 || q.correctIndex >= q.options.length) errors.push(`${q.id}: correctIndex inválido`);
      if (new Set(q.options).size !== q.options.length) errors.push(`${q.id}: alternativas duplicadas`);
    }
    if (q.type === 'fill-blank') {
      const blanks = q.template.split('___').length - 1;
      if (blanks !== q.answers.length) errors.push(`${q.id}: ${blanks} lacunas vs ${q.answers.length} respostas`);
      for (const a of q.answers) if (!q.options.includes(a)) errors.push(`${q.id}: resposta "${a}" fora das opções`);
      if (new Set(q.options).size !== q.options.length) errors.push(`${q.id}: opções duplicadas`);
    }
    if (q.type === 'match-pairs') {
      const l = q.pairs.map((p) => p.left), r = q.pairs.map((p) => p.right);
      if (new Set(l).size !== l.length || new Set(r).size !== r.length) errors.push(`${q.id}: pares duplicados`);
    }
  }
}
console.log(`Módulos: ${modules.length} | Lições: ${allLessons.length} | Questões: ${questionCount}`);
console.log('Por tipo:', counts);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('OK: dados válidos.');
