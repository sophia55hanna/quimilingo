import { Dumbbell, FlaskConical, Home, UserRound, type LucideIcon } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { cn } from '../lib/utils';
import type { AppTab } from '../types/chemistry';

interface NavItem {
  tab: AppTab;
  label: string;
  icon: LucideIcon;
}

const items: NavItem[] = [
  { tab: 'learn', label: 'Aprender', icon: Home },
  { tab: 'review', label: 'Praticar', icon: Dumbbell },
  { tab: 'profile', label: 'Perfil', icon: UserRound },
];

interface NavbarProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

export function Navbar({ active, onChange }: NavbarProps) {
  const { mistakeCount } = useGame();

  return (
    <>
      {/* Desktop: barra lateral */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r-2 border-duo-border bg-duo-bg px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-b-4 border-duo-green-dark bg-duo-green">
            <FlaskConical className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-duo-green">QuímiLingo</span>
        </div>
        <nav className="flex flex-col gap-2">
          {items.map((item) => (
            <NavButton
              key={item.tab}
              item={item}
              active={active === item.tab}
              badge={item.tab === 'review' ? mistakeCount : 0}
              onClick={() => onChange(item.tab)}
              variant="side"
            />
          ))}
        </nav>
      </aside>

      {/* Mobile: barra inferior */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t-2 border-duo-border bg-duo-bg md:hidden">
        <div className="mx-auto flex max-w-xl justify-around gap-2 px-2 py-2">
          {items.map((item) => (
            <NavButton
              key={item.tab}
              item={item}
              active={active === item.tab}
              badge={item.tab === 'review' ? mistakeCount : 0}
              onClick={() => onChange(item.tab)}
              variant="bottom"
            />
          ))}
        </div>
      </nav>
    </>
  );
}

interface NavButtonProps {
  item: NavItem;
  active: boolean;
  badge: number;
  onClick: () => void;
  variant: 'side' | 'bottom';
}

function NavButton({ item, active, badge, onClick, variant }: NavButtonProps) {
  const Icon = item.icon;
  const badgeEl =
    badge > 0 ? (
      <span className="absolute -right-2 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-duo-red px-1 text-[11px] font-black text-white">
        {badge > 99 ? '99+' : badge}
      </span>
    ) : null;

  if (variant === 'side') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-4 rounded-xl border-2 px-4 py-3 text-left text-sm font-extrabold uppercase tracking-wider transition-colors',
          active ? 'border-duo-blue/60 bg-duo-blue/15 text-duo-blue' : 'border-transparent text-duo-muted hover:bg-duo-surface',
        )}
      >
        <span className="relative">
          <Icon className="h-7 w-7" strokeWidth={2.5} />
          {badgeEl}
        </span>
        {item.label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 py-1.5 transition-colors',
        active ? 'border-duo-blue/60 bg-duo-blue/15 text-duo-blue' : 'border-transparent text-duo-muted',
      )}
    >
      <span className="relative">
        <Icon className="h-7 w-7" strokeWidth={2.5} />
        {badgeEl}
      </span>
      <span className="text-[11px] font-extrabold uppercase tracking-wide">{item.label}</span>
    </button>
  );
}
