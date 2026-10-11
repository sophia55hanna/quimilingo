import { BookOpenCheck, Check, Crown, Lock, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { REPLAY_XP, useGame } from '../../context/GameContext';
import { modules } from '../../data/chemistryData';
import { moduleIcons, moduleThemes, type ModuleTheme } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Lesson, Module } from '../../types/chemistry';
import { DuoButton } from '../ui/DuoButton';

/** Deslocamento horizontal (px) dos nós, criando a trilha em zigue-zague. */
const ZIGZAG = [0, 52, 78, 52, 0, -52, -78, -52];

interface LearningMapProps {
  onStartLesson: (lessonId: string) => void;
}

export function LearningMap({ onStartLesson }: LearningMapProps) {
  const { currentLessonId } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  let globalIndex = 0;

  return (
    <div className="flex flex-col gap-10 pb-10 pt-6" onClick={() => setSelected(null)}>
      {modules.map((module) => (
        <section key={module.id} aria-labelledby={`${module.id}-title`}>
          <ModuleBanner module={module} />
          <div className="mt-14 flex flex-col items-center gap-12">
            {module.lessons.map((lesson) => {
              const offset = ZIGZAG[globalIndex % ZIGZAG.length];
              globalIndex++;
              const isCurrent = lesson.id === currentLessonId;
              return (
                <div
                  key={lesson.id}
                  ref={isCurrent ? currentRef : undefined}
                  className={cn('relative', selected === lesson.id && 'z-30')}
                  style={{ transform: `translateX(${offset}px)` }}
                >
                  <LessonNode
                    lesson={lesson}
                    module={module}
                    isCurrent={isCurrent}
                    offset={offset}
                    isOpen={selected === lesson.id}
                    onToggle={() => setSelected((cur) => (cur === lesson.id ? null : lesson.id))}
                    onStart={() => {
                      setSelected(null);
                      onStartLesson(lesson.id);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="mx-auto mt-4 flex max-w-sm flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-duo-border p-6 text-center">
        <Crown className="h-12 w-12 fill-duo-yellow text-duo-yellow" />
        <p className="text-lg font-extrabold">Fim da trilha</p>
        <p className="text-sm text-duo-muted">
          Conclua os 11 módulos para dominar a base atômica e as funções inorgânicas!
        </p>
      </div>
    </div>
  );
}

function ModuleBanner({ module }: { module: Module }) {
  const { isLessonCompleted, isLessonUnlocked } = useGame();
  const theme = moduleThemes[module.color];
  const Icon = moduleIcons[module.icon];
  const done = module.lessons.filter((l) => isLessonCompleted(l.id)).length;
  const unlocked = isLessonUnlocked(module.lessons[0].id);

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border-b-4 p-4 text-white transition-colors',
        unlocked ? cn(theme.bg, theme.border) : 'border-[#2a3a42] bg-duo-border',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold uppercase tracking-widest opacity-80">
          Módulo {module.number} · {done}/{module.lessons.length} lições
        </p>
        <h2 id={`${module.id}-title`} className="mt-0.5 text-lg font-black leading-tight sm:text-xl">
          {module.title}
        </h2>
        <p className="mt-1 text-sm font-semibold opacity-90">{module.description}</p>
      </div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/30 bg-black/10">
        {unlocked ? <Icon className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
      </div>
    </div>
  );
}

interface LessonNodeProps {
  lesson: Lesson;
  module: Module;
  isCurrent: boolean;
  offset: number;
  isOpen: boolean;
  onToggle: () => void;
  onStart: () => void;
}

function LessonNode({ lesson, module, isCurrent, offset, isOpen, onToggle, onStart }: LessonNodeProps) {
  const { isLessonCompleted, isLessonUnlocked, progress, playSound } = useGame();
  const theme = moduleThemes[module.color];
  const completed = isLessonCompleted(lesson.id);
  const unlocked = isLessonUnlocked(lesson.id);
  const perfect = (progress.completedLessons[lesson.id]?.bestAccuracy ?? 0) >= 1;

  const NodeIcon = !unlocked ? Lock : perfect ? Crown : completed ? Check : Star;

  return (
    <div className="relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
      {isCurrent && !isOpen && (
        <div
          className={cn(
            'absolute -top-11 z-10 animate-float whitespace-nowrap rounded-xl border-2 border-duo-border bg-duo-bg px-3 py-1.5 text-sm font-black uppercase tracking-wider',
            theme.text,
          )}
        >
          Começar
          <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-duo-border bg-duo-bg" />
        </div>
      )}

      <div className="relative">
        {isCurrent && <span className={cn('absolute -inset-2.5 rounded-full ring-[6px]', theme.ring)} aria-hidden />}
        <button
          type="button"
          onClick={() => {
            playSound('click');
            onToggle();
          }}
          aria-label={`${lesson.title}${completed ? ' (concluída)' : unlocked ? '' : ' (bloqueada)'}`}
          aria-expanded={isOpen}
          className={cn(
            'relative flex h-[70px] w-[76px] items-center justify-center rounded-[50%] border-b-[7px] transition-all duration-100',
            'active:translate-y-1 active:border-b-[3px]',
            !unlocked && 'border-[#2a3a42] bg-duo-border text-duo-muted',
            unlocked && !perfect && cn(theme.bg, theme.border, 'text-white'),
            perfect && 'border-duo-yellow-dark bg-duo-yellow text-white',
          )}
        >
          <NodeIcon className={cn('h-8 w-8', perfect && 'fill-white')} strokeWidth={3} />
        </button>
      </div>

      {isOpen && (
        <LessonPopover
          lesson={lesson}
          theme={theme}
          unlocked={unlocked}
          completed={completed}
          accuracy={progress.completedLessons[lesson.id]?.bestAccuracy}
          offset={offset}
          onStart={onStart}
        />
      )}
    </div>
  );
}

interface LessonPopoverProps {
  lesson: Lesson;
  theme: ModuleTheme;
  unlocked: boolean;
  completed: boolean;
  accuracy?: number;
  offset: number;
  onStart: () => void;
}

function LessonPopover({ lesson, theme, unlocked, completed, accuracy, offset, onStart }: LessonPopoverProps) {
  // O popover é recentralizado na coluna (desfaz o zigue-zague) para não vazar da tela no mobile.
  return (
    <div
      className="absolute left-1/2 top-[92px] w-72 max-w-[calc(100vw-2rem)]"
      style={{ transform: `translateX(calc(-50% - ${offset}px))` }}
    >
      <div
        role="dialog"
        aria-label={lesson.title}
        className={cn(
          'relative animate-pop rounded-2xl p-4 shadow-2xl',
          unlocked ? cn(theme.bg, 'text-white') : 'border-2 border-duo-border bg-duo-surface text-duo-text',
        )}
      >
        <span
          className={cn(
            'absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45',
            unlocked ? theme.bg : 'border-l-2 border-t-2 border-duo-border bg-duo-surface',
          )}
          style={{ left: `calc(50% + ${offset}px)` }}
        />
        <p className="text-lg font-black leading-tight">{lesson.title}</p>
        <p className={cn('mt-1 text-sm font-semibold', unlocked ? 'opacity-90' : 'text-duo-muted')}>
          {unlocked ? lesson.description : 'Conclua a lição anterior para desbloquear esta.'}
        </p>
        {unlocked && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider opacity-90">
            <BookOpenCheck className="h-4 w-4" />
            {lesson.questions.length} exercícios
            {completed && accuracy !== undefined && ` · melhor: ${Math.round(accuracy * 100)}%`}
          </p>
        )}
        {unlocked && (
          <button
            type="button"
            onClick={onStart}
            className={cn(
              'mt-4 w-full rounded-2xl border-b-4 border-black/20 bg-white py-3 text-sm font-black uppercase tracking-wider transition-all',
              'active:mb-1 active:translate-y-1 active:border-b-0',
              theme.text,
            )}
          >
            {completed ? `Praticar de novo +${REPLAY_XP} XP` : `Começar +${lesson.xpReward} XP`}
          </button>
        )}
        {!unlocked && (
          <DuoButton fullWidth disabled className="mt-4">
            Bloqueada
          </DuoButton>
        )}
      </div>
    </div>
  );
}
