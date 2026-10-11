import { Flame, Heart, Infinity as InfinityIcon, Zap } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MAX_HEARTS, useGame } from '../context/GameContext';
import { cn, formatCountdown } from '../lib/utils';
import { useNow } from '../lib/useNow';

type Popover = 'hearts' | 'streak' | 'xp' | null;

export function Header() {
  const { hearts, streak, xp, studiedToday, nextHeartAt, dailyXp } = useGame();
  const [open, setOpen] = useState<Popover>(null);
  const now = useNow(1000, open === 'hearts');
  const ref = useRef<HTMLDivElement>(null);

  // Animação de tremor quando uma vida é perdida
  const [shake, setShake] = useState(false);
  const previousHearts = useRef(hearts);
  useEffect(() => {
    const lost = hearts < previousHearts.current;
    previousHearts.current = hearts;
    if (!lost) return;
    setShake(true);
    const id = window.setTimeout(() => setShake(false), 600);
    return () => window.clearTimeout(id);
  }, [hearts]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const toggle = (p: Exclude<Popover, null>) => setOpen((cur) => (cur === p ? null : p));

  return (
    <header className="sticky top-0 z-30 border-b-2 border-duo-border bg-duo-bg/95 backdrop-blur">
      <div ref={ref} className="relative mx-auto flex h-16 max-w-xl items-center justify-between px-4">
        <span className="text-lg font-black tracking-tight text-duo-green md:hidden">QuímiLingo</span>
        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <StatButton
            label="Ofensiva"
            onClick={() => toggle('streak')}
            icon={<Flame className={cn('h-6 w-6', studiedToday ? 'fill-duo-orange text-duo-orange' : 'text-duo-muted')} />}
            value={streak}
            valueClass={studiedToday ? 'text-duo-orange' : 'text-duo-muted'}
          />
          <StatButton
            label="Experiência"
            onClick={() => toggle('xp')}
            icon={<Zap className="h-6 w-6 fill-duo-yellow text-duo-yellow" />}
            value={xp}
            valueClass="text-duo-yellow"
          />
          <StatButton
            label="Vidas"
            onClick={() => toggle('hearts')}
            icon={
              <Heart
                className={cn(
                  'h-6 w-6',
                  hearts > 0 ? 'fill-duo-red text-duo-red' : 'text-duo-muted',
                  shake && 'animate-heart-loss',
                )}
              />
            }
            value={hearts}
            valueClass={hearts > 0 ? 'text-duo-red' : 'text-duo-muted'}
            className={shake ? 'animate-shake' : undefined}
          />
        </div>

        {open && (
          <div className="absolute right-4 top-[60px] w-72 animate-pop rounded-2xl border-2 border-duo-border bg-duo-surface p-4 shadow-2xl">
            {open === 'hearts' && (
              <>
                <p className="text-lg font-extrabold">
                  Vidas <span className="text-duo-red">{hearts}</span>
                  <span className="text-duo-muted">/{MAX_HEARTS}</span>
                </p>
                <div className="my-3 grid grid-cols-8 gap-1">
                  {Array.from({ length: MAX_HEARTS }, (_, i) => (
                    <Heart key={i} className={cn('h-6 w-6', i < hearts ? 'fill-duo-red text-duo-red' : 'text-duo-border')} />
                  ))}
                </div>
                <p className="text-sm text-duo-muted">
                  {nextHeartAt === null ? (
                    <span className="flex items-center gap-1">
                      <InfinityIcon className="h-4 w-4" /> Suas vidas estão cheias!
                    </span>
                  ) : (
                    <>
                      Próxima vida em <strong className="text-duo-text">{formatCountdown(nextHeartAt - now)}</strong>.
                      Complete uma sessão de prática para recuperar vidas mais rápido.
                    </>
                  )}
                </p>
              </>
            )}
            {open === 'streak' && (
              <>
                <p className="text-lg font-extrabold">
                  Ofensiva de {streak} {streak === 1 ? 'dia' : 'dias'}
                </p>
                <p className="mt-2 text-sm text-duo-muted">
                  {studiedToday
                    ? 'Você já estudou hoje. Volte amanhã para manter a chama acesa! 🔥'
                    : 'Complete uma lição hoje para aumentar sua ofensiva.'}
                </p>
              </>
            )}
            {open === 'xp' && (
              <>
                <p className="text-lg font-extrabold">{xp} XP no total</p>
                <p className="mt-2 text-sm text-duo-muted">
                  Hoje você ganhou {dailyXp} XP. Cada lição vale 10 XP + bônus de precisão.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

interface StatButtonProps {
  label: string;
  icon: ReactNode;
  value: number;
  valueClass: string;
  onClick: () => void;
  className?: string;
}

function StatButton({ label, icon, value, valueClass, onClick, className }: StatButtonProps) {
  return (
    <button
      type="button"
      aria-label={`${label}: ${value}`}
      onClick={onClick}
      className={cn('flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5', className)}
    >
      {icon}
      <span className={cn('text-base font-extrabold tabular-nums', valueClass)}>{value}</span>
    </button>
  );
}
