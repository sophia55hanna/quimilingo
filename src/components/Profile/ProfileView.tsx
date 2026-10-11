import {
  Award,
  BookOpenCheck,
  Crown,
  Flame,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useGame } from '../../context/GameContext';
import { modules, totalLessons } from '../../data/chemistryData';
import { moduleIcons, moduleThemes } from '../../lib/theme';
import { addDays, cn, toDateKey } from '../../lib/utils';
import type { UserProgress } from '../../types/chemistry';
import { DuoButton } from '../ui/DuoButton';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  unlocked: (p: UserProgress) => boolean;
}

const isModuleDone = (p: UserProgress, moduleId: string) =>
  modules.find((m) => m.id === moduleId)?.lessons.every((l) => p.completedLessons[l.id]) ?? false;

const achievements: Achievement[] = [
  {
    id: 'first',
    title: 'Primeiro experimento',
    description: 'Conclua sua primeira lição.',
    icon: FlaskConical,
    unlocked: (p) => Object.keys(p.completedLessons).length >= 1,
  },
  {
    id: 'streak3',
    title: 'Em combustão',
    description: 'Alcance uma ofensiva de 3 dias.',
    icon: Flame,
    unlocked: (p) => p.longestStreak >= 3,
  },
  {
    id: 'xp100',
    title: 'Reator energético',
    description: 'Acumule 100 XP.',
    icon: Zap,
    unlocked: (p) => p.xp >= 100,
  },
  {
    id: 'perfect5',
    title: 'Precisão analítica',
    description: 'Termine 5 lições com 100% de precisão.',
    icon: Crown,
    unlocked: (p) => Object.values(p.completedLessons).filter((r) => r.bestAccuracy >= 1).length >= 5,
  },
  {
    id: 'atom',
    title: 'Arquiteto atômico',
    description: 'Conclua os módulos 1 a 3.',
    icon: Sparkles,
    unlocked: (p) => ['m1', 'm2', 'm3'].every((id) => isModuleDone(p, id)),
  },
  {
    id: 'acids',
    title: 'Mestre dos ácidos',
    description: 'Conclua os módulos de ácidos (6 e 7).',
    icon: Award,
    unlocked: (p) => isModuleDone(p, 'm6') && isModuleDone(p, 'm7'),
  },
  {
    id: 'all',
    title: 'Químico completo',
    description: 'Conclua todos os 11 módulos.',
    icon: Trophy,
    unlocked: (p) => Object.keys(p.completedLessons).length >= totalLessons,
  },
];

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function ProfileView() {
  const { progress, xp, streak, completedCount, mistakeCount, toggleSound, resetProgress, isLessonCompleted } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const perfectCount = Object.values(progress.completedLessons).filter((r) => r.bestAccuracy >= 1).length;

  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    return { key: toDateKey(date), label: WEEKDAYS[date.getDay()], isToday: i === 6 };
  });
  const studied = new Set(progress.studyDays);

  return (
    <div className="flex flex-col gap-8 py-6">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-b-4 border-duo-purple-dark bg-duo-purple">
          <FlaskConical className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Seu laboratório</h1>
          <p className="text-duo-muted">
            {completedCount}/{totalLessons} lições concluídas
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-black">Estatísticas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<Flame className="h-6 w-6 fill-duo-orange text-duo-orange" />} value={streak} label="Ofensiva atual" />
          <Stat icon={<Zap className="h-6 w-6 fill-duo-yellow text-duo-yellow" />} value={xp} label="Total de XP" />
          <Stat icon={<Trophy className="h-6 w-6 text-duo-yellow" />} value={progress.longestStreak} label="Maior ofensiva" />
          <Stat icon={<Crown className="h-6 w-6 fill-duo-yellow text-duo-yellow" />} value={perfectCount} label="Lições perfeitas" />
          <Stat icon={<BookOpenCheck className="h-6 w-6 text-duo-green" />} value={completedCount} label="Lições concluídas" />
          <Stat icon={<RotateCcw className="h-6 w-6 text-duo-red" />} value={mistakeCount} label="Erros a revisar" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black">Últimos 7 dias</h2>
        <div className="flex justify-between rounded-2xl border-2 border-duo-border p-4">
          {week.map((day) => {
            const active = studied.has(day.key);
            return (
              <div key={day.key} className="flex flex-col items-center gap-2">
                <span className={cn('text-xs font-black', day.isToday ? 'text-duo-text' : 'text-duo-muted')}>{day.label}</span>
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    active ? 'bg-duo-orange' : 'bg-duo-border',
                    day.isToday && !active && 'ring-2 ring-duo-orange/50',
                  )}
                >
                  <Flame className={cn('h-5 w-5', active ? 'fill-white text-white' : 'text-duo-muted')} />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black">Progresso por módulo</h2>
        <div className="flex flex-col gap-3">
          {modules.map((module) => {
            const theme = moduleThemes[module.color];
            const Icon = moduleIcons[module.icon];
            const done = module.lessons.filter((l) => isLessonCompleted(l.id)).length;
            const pct = (done / module.lessons.length) * 100;
            return (
              <div key={module.id} className="flex items-center gap-3 rounded-2xl border-2 border-duo-border p-3">
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', theme.soft)}>
                  <Icon className={cn('h-6 w-6', theme.text)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-extrabold">
                      {module.number}. {module.title}
                    </p>
                    <span className="shrink-0 text-xs font-bold text-duo-muted">
                      {done}/{module.lessons.length}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-duo-border">
                    <div className={cn('h-full rounded-full transition-[width] duration-500', theme.bg)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black">Conquistas</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => {
            const unlocked = a.unlocked(progress);
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 p-3',
                  unlocked ? 'border-duo-yellow/50 bg-duo-yellow/10' : 'border-duo-border opacity-60',
                )}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-b-4',
                    unlocked ? 'border-duo-yellow-dark bg-duo-yellow text-white' : 'border-[#2a3a42] bg-duo-border text-duo-muted',
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-extrabold">{a.title}</p>
                  <p className="text-xs text-duo-muted">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black">Configurações</h2>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={toggleSound}
            role="switch"
            aria-checked={progress.soundEnabled}
            className="flex items-center gap-3 rounded-2xl border-2 border-duo-border p-4 text-left transition-colors hover:bg-duo-surface"
          >
            {progress.soundEnabled ? <Volume2 className="h-6 w-6 text-duo-blue" /> : <VolumeX className="h-6 w-6 text-duo-muted" />}
            <span className="flex-1 font-extrabold">Efeitos sonoros</span>
            <span
              className={cn(
                'relative h-7 w-12 rounded-full transition-colors',
                progress.soundEnabled ? 'bg-duo-blue' : 'bg-duo-border',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 h-5 w-5 rounded-full bg-white transition-all',
                  progress.soundEnabled ? 'left-6' : 'left-1',
                )}
              />
            </span>
          </button>

          {confirmReset ? (
            <div className="animate-pop rounded-2xl border-2 border-duo-red/50 bg-duo-red/10 p-4">
              <p className="font-extrabold">Apagar todo o progresso?</p>
              <p className="mt-1 text-sm text-duo-muted">XP, ofensiva, lições e erros salvos neste navegador serão perdidos.</p>
              <div className="mt-4 flex gap-3">
                <DuoButton variant="outline" className="flex-1" onClick={() => setConfirmReset(false)}>
                  Cancelar
                </DuoButton>
                <DuoButton
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                  }}
                >
                  Apagar
                </DuoButton>
              </div>
            </div>
          ) : (
            <DuoButton variant="outline" fullWidth onClick={() => setConfirmReset(true)} className="text-duo-red">
              Reiniciar progresso
            </DuoButton>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-duo-border p-3">
      {icon}
      <div className="min-w-0">
        <p className="text-lg font-black leading-tight tabular-nums">{value}</p>
        <p className="truncate text-xs font-bold text-duo-muted">{label}</p>
      </div>
    </div>
  );
}
