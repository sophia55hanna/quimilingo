import { AlertTriangle, Dumbbell, Heart, PartyPopper, Shuffle, Target } from 'lucide-react';
import { useMemo } from 'react';
import { MAX_HEARTS, useGame } from '../../context/GameContext';
import { allLessons, lessonsById, questionsById } from '../../data/chemistryData';
import { moduleThemes } from '../../lib/theme';
import { cn, shuffle } from '../../lib/utils';
import type { MistakeEntry, Question } from '../../types/chemistry';
import { ChemText } from '../ChemText';
import { DuoButton } from '../ui/DuoButton';

const SESSION_SIZE = 8;

interface ReviewModeProps {
  onStartReview: (questionIds: string[], title: string) => void;
}

function questionPreview(question: Question): string {
  switch (question.type) {
    case 'multiple-choice':
    case 'fill-blank':
    case 'match-pairs':
      return question.prompt;
    case 'true-false':
      return question.statement;
  }
}

export function ReviewMode({ onStartReview }: ReviewModeProps) {
  const { progress, hearts, completedCount } = useGame();

  const mistakes = useMemo(
    () =>
      Object.values(progress.mistakes).sort((a, b) => b.count - a.count || b.lastMissedAt - a.lastMissedAt),
    [progress.mistakes],
  );

  // Agrupa os erros por módulo, na ordem da trilha
  const grouped = useMemo(() => {
    const groups = new Map<string, MistakeEntry[]>();
    for (const mistake of mistakes) {
      const moduleId = lessonsById.get(mistake.lessonId)?.module.id;
      if (!moduleId) continue;
      groups.set(moduleId, [...(groups.get(moduleId) ?? []), mistake]);
    }
    const order = [...new Set(allLessons.map((l) => l.module))];
    return order.filter((m) => groups.has(m.id)).map((module) => ({ module, items: groups.get(module.id)! }));
  }, [mistakes]);

  const startMistakeReview = () => {
    // Prioriza as questões mais erradas e embaralha a sessão
    const ids = mistakes.slice(0, SESSION_SIZE).map((m) => m.questionId);
    onStartReview(shuffle(ids), 'Revisão de erros');
  };

  const startFreePractice = () => {
    const pool = allLessons
      .filter((ref) => progress.completedLessons[ref.lesson.id])
      .flatMap((ref) => ref.lesson.questions.map((q) => q.id));
    onStartReview(shuffle(pool).slice(0, SESSION_SIZE), 'Prática livre');
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Praticar</h1>
        <p className="mt-1 text-duo-muted">Revise seus erros sem perder vidas — e recupere uma vida a cada sessão concluída.</p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border-2 border-duo-border p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-duo-red/15">
          <Heart className="h-8 w-8 fill-duo-red text-duo-red" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold">
            {hearts}/{MAX_HEARTS} vidas
          </p>
          <p className="text-sm text-duo-muted">
            {hearts >= MAX_HEARTS ? 'Vidas cheias! Pratique para reforçar o conteúdo.' : 'Conclua uma prática para ganhar +1 vida.'}
          </p>
        </div>
      </div>

      {/* Revisão de erros */}
      <div className="overflow-hidden rounded-2xl border-2 border-duo-border">
        <div className="flex items-center gap-4 bg-duo-surface p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-b-4 border-duo-purple-dark bg-duo-purple">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-black">Revisão de erros</p>
            <p className="text-sm text-duo-muted">
              {mistakes.length === 0
                ? 'Nenhum erro pendente. Continue assim!'
                : `${mistakes.length} ${mistakes.length === 1 ? 'questão para revisar' : 'questões para revisar'}`}
            </p>
          </div>
        </div>
        <div className="p-4">
          <DuoButton variant="secondary" fullWidth disabled={mistakes.length === 0} onClick={startMistakeReview}>
            {mistakes.length === 0 ? 'Tudo revisado' : `Revisar ${Math.min(SESSION_SIZE, mistakes.length)} questões`}
          </DuoButton>
        </div>
      </div>

      {/* Prática livre */}
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-duo-border p-5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-b-4 border-duo-green-dark bg-duo-green">
            <Shuffle className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-lg font-black">Prática livre</p>
            <p className="text-sm text-duo-muted">
              {completedCount === 0
                ? 'Conclua sua primeira lição para liberar.'
                : `${SESSION_SIZE} questões aleatórias das lições concluídas.`}
            </p>
          </div>
        </div>
        <DuoButton disabled={completedCount === 0} onClick={startFreePractice} className="sm:w-40">
          Praticar
        </DuoButton>
      </div>

      {/* Lista de erros */}
      {grouped.length > 0 ? (
        <div className="flex flex-col gap-5">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <AlertTriangle className="h-5 w-5 text-duo-orange" /> Seus pontos fracos
          </h2>
          {grouped.map(({ module, items }) => {
            const theme = moduleThemes[module.color];
            return (
              <div key={module.id} className="flex flex-col gap-2">
                <p className={cn('text-xs font-black uppercase tracking-widest', theme.text)}>
                  Módulo {module.number} · {module.title}
                </p>
                {items.map((mistake) => {
                  const ref = questionsById.get(mistake.questionId);
                  if (!ref) return null;
                  return (
                    <div
                      key={mistake.questionId}
                      className="flex items-start gap-3 rounded-xl border-2 border-duo-border bg-duo-surface/50 px-4 py-3"
                    >
                      <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', theme.bg)} />
                      <p className="flex-1 text-sm font-semibold leading-relaxed">
                        <ChemText text={questionPreview(ref.question)} />
                      </p>
                      <span className="shrink-0 rounded-lg bg-duo-red/15 px-2 py-0.5 text-xs font-black text-duo-red">
                        {mistake.count}×
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-duo-border p-8 text-center">
          {completedCount === 0 ? (
            <Dumbbell className="h-12 w-12 text-duo-muted" />
          ) : (
            <PartyPopper className="h-12 w-12 text-duo-yellow" />
          )}
          <p className="font-extrabold">{completedCount === 0 ? 'Ainda não há o que revisar' : 'Nenhum erro pendente!'}</p>
          <p className="max-w-xs text-sm text-duo-muted">
            As questões que você errar nas lições aparecem aqui para revisão espaçada.
          </p>
        </div>
      )}
    </div>
  );
}
