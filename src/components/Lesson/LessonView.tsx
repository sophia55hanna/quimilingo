import { CheckCircle2, Dumbbell, Flame, Heart, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { REPLAY_XP, useGame } from '../../context/GameContext';
import { lessonsById, questionsById } from '../../data/chemistryData';
import { cn } from '../../lib/utils';
import type { ExerciseStatus, Question, SessionSummary, StudySession } from '../../types/chemistry';
import { ChemText } from '../ChemText';
import { DuoButton } from '../ui/DuoButton';
import { LessonCompleteModal } from './LessonCompleteModal';
import { OutOfHeartsModal } from './OutOfHeartsModal';
import { QuestionCard, getCorrectAnswerText } from './QuestionCard';

const PRAISE = ['Excelente!', 'Muito bem!', 'Perfeito!', 'Mandou bem!', 'Isso aí!', 'Incrível!'];
const REVIEW_BASE_XP = 10;

interface QueueItem {
  question: Question;
  /** Chave única por tentativa (força remontagem do card ao repetir uma questão). */
  key: string;
}

type Phase = 'playing' | 'complete' | 'out-of-hearts';

interface LessonViewProps {
  session: StudySession;
  onClose: () => void;
  onGoPractice: () => void;
}

export function LessonView({ session, onClose, onGoPractice }: LessonViewProps) {
  const game = useGame();
  const { hearts, playSound } = game;
  const isReview = session.mode === 'review';

  const { title, questions, lessonId, accent } = useMemo(() => {
    if (session.mode === 'lesson') {
      const ref = lessonsById.get(session.lessonId);
      return {
        title: ref?.lesson.title ?? 'Lição',
        questions: ref?.lesson.questions ?? [],
        lessonId: session.lessonId,
        accent: ref?.module.title ?? '',
      };
    }
    return {
      title: session.title,
      questions: session.questionIds
        .map((id) => questionsById.get(id)?.question)
        .filter((q): q is Question => Boolean(q)),
      lessonId: null,
      accent: 'Modo prática',
    };
  }, [session]);

  // Valores fixados no início da sessão
  const [wasCompleted] = useState(() => (lessonId ? game.isLessonCompleted(lessonId) : false));
  const [startedAt] = useState(() => Date.now());

  const [queue, setQueue] = useState<QueueItem[]>(() => questions.map((q) => ({ question: q, key: q.id })));
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const [answer, setAnswer] = useState({ ready: false, correct: false });
  const [missed, setMissed] = useState<Set<string>>(() => new Set());
  const [solved, setSolved] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [heartShake, setHeartShake] = useState(0);
  const [praise, setPraise] = useState(PRAISE[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = queue[index];
  const total = questions.length;
  const progressPct = total === 0 ? 0 : (solved / total) * 100;

  const handleAnswerChange = useCallback((ready: boolean, correct: boolean) => {
    setAnswer({ ready, correct });
  }, []);

  const check = useCallback(() => {
    if (!current || status !== 'idle' || !answer.ready) return;
    const questionId = current.question.id;

    if (answer.correct) {
      playSound('correct');
      setStatus('correct');
      setSolved((s) => s + 1);
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
      if (isReview) game.resolveMistake(questionId);
    } else {
      playSound('wrong');
      setStatus('wrong');
      setCombo(0);
      setMissed((m) => new Set(m).add(questionId));
      game.recordMistake(questionId);
      if (!isReview) {
        game.loseHeart();
        setHeartShake((n) => n + 1);
      }
      // A questão errada volta para o fim da fila
      setQueue((q) => [...q, { question: current.question, key: `${questionId}-retry-${q.length}` }]);
    }
  }, [current, status, answer, combo, isReview, game, playSound]);

  const finish = useCallback(() => {
    const accuracy = total === 0 ? 1 : (total - missed.size) / total;
    const baseXp = isReview ? REVIEW_BASE_XP : wasCompleted ? REPLAY_XP : (lessonsById.get(lessonId ?? '')?.lesson.xpReward ?? 10);
    const bonusXp = accuracy >= 1 ? 5 : accuracy >= 0.8 ? 3 : 0;
    const xpEarned = baseXp + bonusXp;
    const heartsRestored = isReview ? 1 : 0;
    const completion = isReview
      ? game.completeReview(xpEarned, heartsRestored)
      : game.completeLesson(lessonId as string, accuracy, xpEarned);

    playSound('complete');
    setSummary({
      mode: session.mode,
      xpEarned,
      baseXp,
      bonusXp,
      accuracy,
      durationMs: Date.now() - startedAt,
      bestCombo,
      totalQuestions: total,
      streakExtended: completion.streakExtended,
      streak: completion.streak,
      heartsRestored,
    });
    setPhase('complete');
  }, [total, missed, isReview, wasCompleted, lessonId, game, playSound, session.mode, startedAt, bestCombo]);

  const advance = useCallback(() => {
    if (status === 'idle') return;
    if (!isReview && status === 'wrong' && hearts <= 0) {
      setPhase('out-of-hearts');
      return;
    }
    if (index + 1 >= queue.length) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    setStatus('idle');
    setAnswer({ ready: false, correct: false });
  }, [status, isReview, hearts, index, queue.length, finish]);

  // Teclado: Enter verifica/continua, Esc pede para sair
  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (confirmExit) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (status === 'idle') check();
        else advance();
      } else if (e.key === 'Escape') {
        setConfirmExit(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, status, check, advance, confirmExit]);

  // Cada nova questão começa do topo da área rolável
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [index]);

  const requestExit = () => {
    if (solved === 0 && missed.size === 0) onClose();
    else setConfirmExit(true);
  };

  if (phase === 'complete' && summary) {
    return <LessonCompleteModal summary={summary} onContinue={onClose} />;
  }

  if (total === 0 || !current) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-duo-bg p-6 text-center">
        <p className="text-xl font-black">Nenhuma questão disponível.</p>
        <DuoButton onClick={onClose}>Voltar</DuoButton>
      </div>
    );
  }

  const correctText = status === 'wrong' ? getCorrectAnswerText(current.question) : null;
  const showComboBanner = status === 'correct' && (combo === 3 || combo === 5 || combo % 10 === 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-duo-bg">
      {/* Topo: sair, barra de progresso e vidas */}
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 pb-2 pt-4 sm:gap-4 sm:pt-6">
        <button
          type="button"
          onClick={requestExit}
          aria-label="Sair da lição"
          className="rounded-lg p-1 text-duo-muted transition-colors hover:bg-white/5 hover:text-duo-text"
        >
          <X className="h-7 w-7" strokeWidth={3} />
        </button>
        <div
          className="relative h-4 flex-1 overflow-hidden rounded-full bg-duo-border"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={solved}
        >
          <div
            className="h-full rounded-full bg-duo-green transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(progressPct, 2)}%` }}
          >
            <div className="mx-2 mt-1 h-1 rounded-full bg-white/30" />
          </div>
        </div>
        {isReview ? (
          <div className="flex items-center gap-1 text-duo-blue" title="Modo prática: sem perda de vidas">
            <Dumbbell className="h-6 w-6" />
          </div>
        ) : (
          <div key={heartShake} className={cn('flex items-center gap-1.5', heartShake > 0 && 'animate-shake')}>
            <Heart
              className={cn(
                'h-7 w-7',
                hearts > 0 ? 'fill-duo-red text-duo-red' : 'text-duo-muted',
                heartShake > 0 && 'animate-heart-loss',
              )}
            />
            <span className={cn('text-lg font-black tabular-nums', hearts > 0 ? 'text-duo-red' : 'text-duo-muted')}>
              {hearts}
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 py-6 sm:py-10">
          <p className="mb-4 text-sm font-bold text-duo-muted">
            {accent} · <span className="text-duo-text">{title}</span>
            {current.key !== current.question.id && (
              <span className="ml-2 rounded-md bg-duo-orange/15 px-2 py-0.5 text-xs font-black uppercase text-duo-orange">
                Erro anterior
              </span>
            )}
          </p>
          <div key={current.key} className="animate-fade-in">
            <QuestionCard question={current.question} status={status} onAnswerChange={handleAnswerChange} />
          </div>
        </div>
      </div>

      {/* Rodapé: verificar / feedback */}
      <div
        className={cn(
          'pb-safe border-t-2 transition-colors',
          status === 'idle' && 'border-duo-border',
          status === 'correct' && 'animate-slide-up border-transparent bg-[#1d3a1a]',
          status === 'wrong' && 'animate-slide-up border-transparent bg-[#3d1f22]',
        )}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-6">
          {status === 'idle' ? (
            <>
              <p className="hidden text-sm font-bold text-duo-muted sm:block">
                {answer.ready ? 'Pressione Enter para verificar' : 'Escolha sua resposta'}
              </p>
              <DuoButton disabled={!answer.ready} onClick={check} className="w-full sm:w-44">
                Verificar
              </DuoButton>
            </>
          ) : (
            <>
              <div className="flex min-w-0 gap-3">
                {status === 'correct' ? (
                  <CheckCircle2 className="hidden h-14 w-14 shrink-0 text-duo-green sm:block" />
                ) : (
                  <XCircle className="hidden h-14 w-14 shrink-0 text-duo-red sm:block" />
                )}
                <div className="min-w-0">
                  <p className={cn('text-xl font-black', status === 'correct' ? 'text-duo-green' : 'text-duo-red')}>
                    {status === 'correct' ? praise : 'Resposta incorreta'}
                  </p>
                  {showComboBanner && (
                    <p className="mt-1 flex items-center gap-1 text-sm font-black text-duo-orange">
                      <Flame className="h-4 w-4 fill-current" /> {combo} acertos seguidos!
                    </p>
                  )}
                  {correctText && (
                    <p className="mt-1 text-sm font-bold text-duo-red">
                      Resposta correta: <ChemText text={correctText} className="text-duo-text" />
                    </p>
                  )}
                  <p className={cn('mt-1 text-sm font-semibold', status === 'correct' ? 'text-duo-green/90' : 'text-duo-red/90')}>
                    <ChemText text={current.question.explanation} />
                  </p>
                </div>
              </div>
              <DuoButton
                variant={status === 'correct' ? 'primary' : 'danger'}
                onClick={advance}
                className="w-full shrink-0 sm:w-44"
                autoFocus
              >
                Continuar
              </DuoButton>
            </>
          )}
        </div>
      </div>

      {confirmExit && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 sm:items-center" role="dialog" aria-modal="true">
          <div className="pb-safe w-full max-w-md animate-slide-up rounded-t-3xl border-2 border-duo-border bg-duo-surface p-6 text-center sm:animate-pop sm:rounded-3xl">
            <p className="text-2xl font-black">Espere, não vá embora!</p>
            <p className="mt-2 text-duo-muted">Se sair agora, você vai perder o progresso desta {isReview ? 'prática' : 'lição'}.</p>
            <div className="mt-6 flex flex-col gap-3">
              <DuoButton variant="secondary" fullWidth onClick={() => setConfirmExit(false)} autoFocus>
                Continuar estudando
              </DuoButton>
              <DuoButton variant="ghost" fullWidth onClick={onClose} className="text-duo-red">
                Sair
              </DuoButton>
            </div>
          </div>
        </div>
      )}

      {phase === 'out-of-hearts' && (
        <OutOfHeartsModal onPractice={onGoPractice} onClose={onClose} closeLabel="Sair da lição" />
      )}
    </div>
  );
}
