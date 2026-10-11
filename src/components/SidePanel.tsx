import { Target, Zap } from 'lucide-react';
import { DAILY_XP_GOAL, useGame } from '../context/GameContext';
import { lessonsById } from '../data/chemistryData';
import { moduleThemes } from '../lib/theme';
import { cn } from '../lib/utils';
import { DuoButton } from './ui/DuoButton';

interface SidePanelProps {
  onStartLesson: (lessonId: string) => void;
}

/** Painel lateral (somente desktop largo): meta diária e próxima lição. */
export function SidePanel({ onStartLesson }: SidePanelProps) {
  const { dailyXp, currentLessonId } = useGame();
  const pct = Math.min(100, (dailyXp / DAILY_XP_GOAL) * 100);
  const next = currentLessonId ? lessonsById.get(currentLessonId) : undefined;
  const theme = next ? moduleThemes[next.module.color] : null;

  return (
    <aside className="sticky top-24 hidden w-80 shrink-0 flex-col gap-4 self-start lg:flex">
      <div className="rounded-2xl border-2 border-duo-border p-5">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-duo-orange" />
          <p className="font-black">Meta diária</p>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Zap className="h-8 w-8 shrink-0 fill-duo-yellow text-duo-yellow" />
          <div className="flex-1">
            <div className="relative h-4 overflow-hidden rounded-full bg-duo-border">
              <div className="h-full rounded-full bg-duo-yellow transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-sm font-bold text-duo-muted">
              {Math.min(dailyXp, DAILY_XP_GOAL)}/{DAILY_XP_GOAL} XP {dailyXp >= DAILY_XP_GOAL && '· Meta batida! 🎉'}
            </p>
          </div>
        </div>
      </div>

      {next && theme && (
        <div className="rounded-2xl border-2 border-duo-border p-5">
          <p className={cn('text-xs font-black uppercase tracking-widest', theme.text)}>
            Próxima lição · Módulo {next.module.number}
          </p>
          <p className="mt-1 text-lg font-black">{next.lesson.title}</p>
          <p className="mt-1 text-sm text-duo-muted">{next.lesson.description}</p>
          <DuoButton fullWidth className="mt-4" onClick={() => onStartLesson(next.lesson.id)}>
            Começar
          </DuoButton>
        </div>
      )}
    </aside>
  );
}
