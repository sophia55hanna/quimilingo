import { Clock, Flame, Heart, Target, Trophy, Zap } from 'lucide-react';
import { useEffect, useMemo, type ReactNode } from 'react';
import { cn, formatCountdown } from '../../lib/utils';
import type { SessionSummary } from '../../types/chemistry';
import { DuoButton } from '../ui/DuoButton';

const CONFETTI_COLORS = ['#58cc02', '#1cb0f6', '#ffc800', '#ff4b4b', '#ce82ff', '#ff9600'];

interface LessonCompleteModalProps {
  summary: SessionSummary;
  onContinue: () => void;
}

export function LessonCompleteModal({ summary, onContinue }: LessonCompleteModalProps) {
  const accuracyPct = Math.round(summary.accuracy * 100);
  const perfect = summary.accuracy >= 1;

  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.4 + Math.random() * 1.6,
        size: 6 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: Math.random() > 0.5,
      })),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onContinue();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onContinue]);

  const title =
    summary.mode === 'review'
      ? 'Prática concluída!'
      : perfect
        ? 'Lição perfeita!'
        : accuracyPct >= 80
          ? 'Mandou bem!'
          : 'Lição concluída!';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-duo-bg" role="dialog" aria-modal="true" aria-label={title}>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {confetti.map((c, i) => (
          <span
            key={i}
            className={cn('absolute top-0 block animate-confetti-fall', c.round ? 'rounded-full' : 'rounded-sm')}
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * (c.round ? 1 : 1.6),
              backgroundColor: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-5 py-8 text-center">
        <div className="relative animate-pop">
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-b-8 border-duo-yellow-dark bg-duo-yellow">
            <Trophy className="h-16 w-16 fill-white/30 text-white" strokeWidth={2.2} />
          </div>
          {perfect && (
            <span className="absolute -right-3 -top-2 rotate-12 rounded-lg bg-duo-purple px-2 py-1 text-xs font-black uppercase text-white">
              100%
            </span>
          )}
        </div>

        <h1 className="text-3xl font-black text-duo-yellow sm:text-4xl">{title}</h1>

        <div className="grid w-full grid-cols-3 gap-3">
          <StatCard color="yellow" label="Total XP" icon={<Zap className="h-5 w-5 fill-current" />} value={`+${summary.xpEarned}`} />
          <StatCard color="green" label="Precisão" icon={<Target className="h-5 w-5" />} value={`${accuracyPct}%`} />
          <StatCard color="blue" label="Tempo" icon={<Clock className="h-5 w-5" />} value={formatCountdown(summary.durationMs)} />
        </div>

        <ul className="w-full space-y-2 text-left text-sm font-bold">
          <SummaryLine icon={<Zap className="h-4 w-4 text-duo-yellow" />}>
            XP base: <span className="text-duo-yellow">+{summary.baseXp}</span>
          </SummaryLine>
          {summary.bonusXp > 0 && (
            <SummaryLine icon={<Target className="h-4 w-4 text-duo-green" />}>
              Bônus de precisão: <span className="text-duo-green">+{summary.bonusXp} XP</span>
            </SummaryLine>
          )}
          {summary.bestCombo >= 3 && (
            <SummaryLine icon={<Flame className="h-4 w-4 text-duo-orange" />}>
              Melhor sequência: <span className="text-duo-orange">{summary.bestCombo} acertos seguidos</span>
            </SummaryLine>
          )}
          {summary.heartsRestored > 0 && (
            <SummaryLine icon={<Heart className="h-4 w-4 fill-duo-red text-duo-red" />}>
              Vidas recuperadas: <span className="text-duo-red">+{summary.heartsRestored}</span>
            </SummaryLine>
          )}
        </ul>

        {summary.streakExtended && (
          <div className="flex w-full animate-pop items-center gap-3 rounded-2xl border-2 border-duo-orange/50 bg-duo-orange/10 p-4 text-left">
            <Flame className="h-10 w-10 shrink-0 animate-float fill-duo-orange text-duo-orange" />
            <div>
              <p className="font-black text-duo-orange">
                Ofensiva de {summary.streak} {summary.streak === 1 ? 'dia' : 'dias'}!
              </p>
              <p className="text-sm text-duo-muted">Volte amanhã para manter sua chama acesa.</p>
            </div>
          </div>
        )}
      </div>

      <div className="pb-safe relative border-t-2 border-duo-border">
        <div className="mx-auto w-full max-w-lg p-4">
          <DuoButton fullWidth onClick={onContinue} autoFocus>
            Continuar
          </DuoButton>
        </div>
      </div>
    </div>
  );
}

const statColors = {
  yellow: { box: 'border-duo-yellow bg-duo-yellow', text: 'text-duo-yellow' },
  green: { box: 'border-duo-green bg-duo-green', text: 'text-duo-green' },
  blue: { box: 'border-duo-blue bg-duo-blue', text: 'text-duo-blue' },
} as const;

function StatCard({
  color,
  label,
  icon,
  value,
}: {
  color: keyof typeof statColors;
  label: string;
  icon: ReactNode;
  value: string;
}) {
  const c = statColors[color];
  return (
    <div className={cn('animate-pop overflow-hidden rounded-2xl border-2', c.box)}>
      <p className="py-1 text-[11px] font-black uppercase tracking-wider text-duo-bg">{label}</p>
      <div className={cn('flex items-center justify-center gap-1 rounded-xl bg-duo-bg py-3 text-lg font-black', c.text)}>
        {icon}
        {value}
      </div>
    </div>
  );
}

function SummaryLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 rounded-xl bg-duo-surface px-3 py-2">
      {icon}
      <span>{children}</span>
    </li>
  );
}
