import { HeartCrack } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { formatCountdown } from '../../lib/utils';
import { useNow } from '../../lib/useNow';
import { DuoButton } from '../ui/DuoButton';

interface OutOfHeartsModalProps {
  onPractice: () => void;
  onClose: () => void;
  /** Texto do botão secundário (ex.: “Sair da lição”). */
  closeLabel?: string;
}

export function OutOfHeartsModal({ onPractice, onClose, closeLabel = 'Agora não' }: OutOfHeartsModalProps) {
  const { nextHeartAt } = useGame();
  const now = useNow(1000);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 sm:items-center" role="dialog" aria-modal="true">
      <div className="pb-safe w-full max-w-md animate-slide-up rounded-t-3xl border-2 border-duo-border bg-duo-surface p-6 text-center sm:animate-pop sm:rounded-3xl">
        <HeartCrack className="mx-auto h-20 w-20 animate-shake text-duo-red" strokeWidth={2} />
        <h2 className="mt-4 text-2xl font-black">Você ficou sem vidas!</h2>
        <p className="mt-2 text-duo-muted">
          {nextHeartAt !== null && (
            <>
              Próxima vida em <strong className="text-duo-text">{formatCountdown(nextHeartAt - now)}</strong>.{' '}
            </>
          )}
          Pratique seus erros para recuperar uma vida agora mesmo.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <DuoButton variant="secondary" fullWidth onClick={onPractice}>
            Praticar para ganhar vida
          </DuoButton>
          <DuoButton variant="ghost" fullWidth onClick={onClose}>
            {closeLabel}
          </DuoButton>
        </div>
      </div>
    </div>
  );
}
