import { Check, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { cn, shuffle } from '../../lib/utils';
import type {
  ExerciseStatus,
  FillBlankQuestion,
  MatchPairsQuestion,
  MultipleChoiceQuestion,
  Question,
  TrueFalseQuestion,
} from '../../types/chemistry';
import { ChemText } from '../ChemText';

export interface QuestionCardProps {
  question: Question;
  /** `idle` enquanto o usuário responde; `correct`/`wrong` após verificar. */
  status: ExerciseStatus;
  /** Informa ao pai se já é possível verificar e se a resposta atual está correta. */
  onAnswerChange: (ready: boolean, correct: boolean) => void;
}

const typeLabels: Record<Question['type'], string> = {
  'multiple-choice': 'Múltipla escolha',
  'true-false': 'Verdadeiro ou falso?',
  'fill-blank': 'Complete a lacuna',
  'match-pairs': 'Associe os pares',
};

export function QuestionCard({ question, status, onAnswerChange }: QuestionCardProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <p className="text-xs font-extrabold uppercase tracking-widest text-duo-purple">{typeLabels[question.type]}</p>
      {question.type === 'multiple-choice' && (
        <MultipleChoice question={question} status={status} onAnswerChange={onAnswerChange} />
      )}
      {question.type === 'true-false' && <TrueFalse question={question} status={status} onAnswerChange={onAnswerChange} />}
      {question.type === 'fill-blank' && <FillBlank question={question} status={status} onAnswerChange={onAnswerChange} />}
      {question.type === 'match-pairs' && (
        <MatchPairs question={question} status={status} onAnswerChange={onAnswerChange} />
      )}
    </div>
  );
}

/** Texto da resposta correta, exibido no rodapé de feedback quando o usuário erra. */
export function getCorrectAnswerText(question: Question): string | null {
  switch (question.type) {
    case 'multiple-choice':
      return question.options[question.correctIndex];
    case 'true-false':
      return question.answer ? 'Verdadeiro' : 'Falso';
    case 'fill-blank': {
      let i = 0;
      return question.template.replace(/___/g, () => question.answers[i++] ?? '___');
    }
    case 'match-pairs':
      return null;
  }
}

interface SubProps<Q extends Question> {
  question: Q;
  status: ExerciseStatus;
  onAnswerChange: (ready: boolean, correct: boolean) => void;
}

// ---------------------------------------------------------------------------
// Estilos compartilhados de "cartão tátil"
// ---------------------------------------------------------------------------

type ChoiceState = 'default' | 'selected' | 'correct' | 'wrong' | 'dimmed' | 'matched';

const choiceStyles: Record<ChoiceState, string> = {
  default: 'border-duo-border bg-duo-bg hover:bg-duo-surface text-duo-text',
  selected: 'border-duo-blue bg-duo-blue/15 text-duo-blue',
  correct: 'border-duo-green bg-duo-green/15 text-duo-green',
  wrong: 'border-duo-red bg-duo-red/15 text-duo-red animate-shake',
  dimmed: 'border-duo-border bg-duo-bg text-duo-muted opacity-60',
  matched: 'border-duo-border bg-duo-bg text-duo-muted opacity-40',
};

const choiceBase =
  'w-full rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-base font-bold transition-all duration-100 sm:text-lg disabled:cursor-default';
const choicePress = 'active:mb-1 active:translate-y-1 active:border-b-2';

// ---------------------------------------------------------------------------
// Múltipla escolha
// ---------------------------------------------------------------------------

function MultipleChoice({ question, status, onAnswerChange }: SubProps<MultipleChoiceQuestion>) {
  const { playSound } = useGame();
  const order = useMemo(() => shuffle(question.options.map((_, i) => i)), [question]);
  const [selected, setSelected] = useState<number | null>(null);
  const locked = status !== 'idle';

  const choose = (optionIndex: number) => {
    if (locked) return;
    playSound('click');
    setSelected(optionIndex);
    onAnswerChange(true, optionIndex === question.correctIndex);
  };

  // Atalhos de teclado 1–4
  useEffect(() => {
    if (locked) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= order.length) choose(order[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const stateFor = (optionIndex: number): ChoiceState => {
    if (!locked) return selected === optionIndex ? 'selected' : 'default';
    if (optionIndex === question.correctIndex) return 'correct';
    if (optionIndex === selected) return 'wrong';
    return 'dimmed';
  };

  return (
    <>
      <h2 className="text-xl font-extrabold leading-snug sm:text-2xl">
        <ChemText text={question.prompt} />
      </h2>
      <div className="grid gap-3" role="radiogroup">
        {order.map((optionIndex, position) => {
          const state = stateFor(optionIndex);
          return (
            <button
              key={optionIndex}
              type="button"
              role="radio"
              aria-checked={selected === optionIndex}
              disabled={locked}
              onClick={() => choose(optionIndex)}
              className={cn(choiceBase, !locked && choicePress, choiceStyles[state], 'flex items-center gap-3')}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-black',
                  state === 'default' || state === 'dimmed' ? 'border-duo-border text-duo-muted' : 'border-current',
                )}
              >
                {state === 'correct' ? <Check className="h-4 w-4" strokeWidth={4} /> : state === 'wrong' ? <X className="h-4 w-4" strokeWidth={4} /> : position + 1}
              </span>
              <ChemText text={question.options[optionIndex]} />
            </button>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Verdadeiro ou falso
// ---------------------------------------------------------------------------

function TrueFalse({ question, status, onAnswerChange }: SubProps<TrueFalseQuestion>) {
  const { playSound } = useGame();
  const [selected, setSelected] = useState<boolean | null>(null);
  const locked = status !== 'idle';

  const choose = (value: boolean) => {
    if (locked) return;
    playSound('click');
    setSelected(value);
    onAnswerChange(true, value === question.answer);
  };

  const stateFor = (value: boolean): ChoiceState => {
    if (!locked) return selected === value ? 'selected' : 'default';
    if (value === question.answer) return 'correct';
    if (value === selected) return 'wrong';
    return 'dimmed';
  };

  return (
    <>
      <h2 className="text-xl font-extrabold sm:text-2xl">Esta afirmação é verdadeira ou falsa?</h2>
      <div className="rounded-2xl border-2 border-duo-border bg-duo-surface p-5 text-lg font-semibold leading-relaxed sm:text-xl">
        <ChemText text={question.statement} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((value) => {
          const state = stateFor(value);
          return (
            <button
              key={String(value)}
              type="button"
              disabled={locked}
              onClick={() => choose(value)}
              aria-pressed={selected === value}
              className={cn(
                choiceBase,
                !locked && choicePress,
                choiceStyles[state],
                'flex flex-col items-center gap-2 py-5 text-center',
              )}
            >
              {value ? (
                <Check className="h-8 w-8" strokeWidth={3.5} />
              ) : (
                <X className="h-8 w-8" strokeWidth={3.5} />
              )}
              <span className="font-black uppercase tracking-wider">{value ? 'Verdadeiro' : 'Falso'}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Preencher lacunas
// ---------------------------------------------------------------------------

function FillBlank({ question, status, onAnswerChange }: SubProps<FillBlankQuestion>) {
  const { playSound } = useGame();
  const segments = useMemo(() => question.template.split('___'), [question]);
  const blankCount = segments.length - 1;
  const bank = useMemo(() => shuffle(question.options.map((_, i) => i)), [question]);
  /** Para cada lacuna, o índice da opção escolhida. */
  const [slots, setSlots] = useState<Array<number | null>>(() => Array.from({ length: blankCount }, () => null));
  const locked = status !== 'idle';

  const update = (next: Array<number | null>) => {
    setSlots(next);
    const ready = next.every((v) => v !== null);
    const correct = ready && next.every((v, i) => question.options[v as number] === question.answers[i]);
    onAnswerChange(ready, correct);
  };

  const place = (optionIndex: number) => {
    if (locked) return;
    const empty = slots.indexOf(null);
    if (empty === -1) return;
    playSound('click');
    const next = [...slots];
    next[empty] = optionIndex;
    update(next);
  };

  const remove = (slotIndex: number) => {
    if (locked || slots[slotIndex] === null) return;
    playSound('click');
    const next = [...slots];
    next[slotIndex] = null;
    update(next);
  };

  return (
    <>
      <h2 className="text-xl font-extrabold sm:text-2xl">
        <ChemText text={question.prompt} />
      </h2>
      <div className="rounded-2xl border-2 border-duo-border bg-duo-surface p-5 text-lg font-semibold leading-[2.6] sm:text-xl">
        {segments.map((segment, i) => (
          <span key={i}>
            <ChemText text={segment} />
            {i < blankCount && (
              <Blank
                value={slots[i] === null ? null : question.options[slots[i] as number]}
                state={!locked ? 'idle' : question.options[slots[i] as number] === question.answers[i] ? 'correct' : 'wrong'}
                onClick={() => remove(i)}
              />
            )}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        {bank.map((optionIndex) => {
          const used = slots.includes(optionIndex);
          return (
            <button
              key={optionIndex}
              type="button"
              disabled={used || locked}
              onClick={() => place(optionIndex)}
              className={cn(
                'min-h-[48px] rounded-xl border-2 border-b-4 px-4 py-2 text-base font-bold transition-all duration-100 sm:text-lg',
                used
                  ? 'border-duo-border bg-duo-border text-transparent'
                  : 'border-duo-border bg-duo-bg text-duo-text hover:bg-duo-surface',
                !used && !locked && choicePress,
              )}
            >
              <ChemText text={question.options[optionIndex]} />
            </button>
          );
        })}
      </div>
    </>
  );
}

function Blank({
  value,
  state,
  onClick,
}: {
  value: string | null;
  state: 'idle' | 'correct' | 'wrong';
  onClick: () => void;
}) {
  if (value === null) {
    return (
      <span className="mx-1 inline-block h-9 w-20 translate-y-2 rounded-lg border-b-4 border-dashed border-duo-muted/60 align-baseline" />
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'mx-1 inline-flex animate-pop items-center rounded-xl border-2 border-b-4 px-3 py-0.5 align-baseline leading-normal',
        state === 'idle' && 'border-duo-blue bg-duo-blue/15 text-duo-blue',
        state === 'correct' && 'border-duo-green bg-duo-green/15 text-duo-green',
        state === 'wrong' && 'border-duo-red bg-duo-red/15 text-duo-red',
      )}
    >
      <ChemText text={value} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Associação de pares
// ---------------------------------------------------------------------------

type Side = 'left' | 'right';

function MatchPairs({ question, status, onAnswerChange }: SubProps<MatchPairsQuestion>) {
  const { playSound } = useGame();
  const leftOrder = useMemo(() => shuffle(question.pairs.map((_, i) => i)), [question]);
  const rightOrder = useMemo(() => shuffle(question.pairs.map((_, i) => i)), [question]);
  const [selection, setSelection] = useState<{ side: Side; index: number } | null>(null);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [flashWrong, setFlashWrong] = useState<{ left: number; right: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const locked = status !== 'idle';

  useEffect(() => {
    if (!flashWrong) return;
    const id = window.setTimeout(() => setFlashWrong(null), 650);
    return () => window.clearTimeout(id);
  }, [flashWrong]);

  const pick = (side: Side, index: number) => {
    // Os índices referem-se ao par original, então valem para as duas colunas.
    if (locked || matched.has(index)) return;

    if (!selection || selection.side === side) {
      playSound('click');
      setSelection(selection?.side === side && selection.index === index ? null : { side, index });
      return;
    }

    const left = side === 'left' ? index : selection.index;
    const right = side === 'right' ? index : selection.index;
    setSelection(null);

    if (left === right) {
      playSound('match');
      const next = new Set(matched).add(left);
      setMatched(next);
      if (next.size === question.pairs.length) onAnswerChange(true, mistakes === 0);
    } else {
      playSound('wrong');
      setFlashWrong({ left, right });
      setMistakes((m) => m + 1);
    }
  };

  const stateFor = (side: Side, index: number): ChoiceState => {
    if (matched.has(index)) return locked ? (status === 'correct' ? 'correct' : 'matched') : 'matched';
    if (flashWrong && flashWrong[side] === index) return 'wrong';
    if (selection?.side === side && selection.index === index) return 'selected';
    return 'default';
  };

  const renderColumn = (side: Side, order: number[]) => (
    <div className="flex flex-col gap-3">
      {order.map((index) => {
        const state = stateFor(side, index);
        const text = side === 'left' ? question.pairs[index].left : question.pairs[index].right;
        return (
          <button
            key={index}
            type="button"
            disabled={locked || matched.has(index)}
            onClick={() => pick(side, index)}
            className={cn(
              choiceBase,
              'flex min-h-[64px] items-center justify-center px-3 text-center text-sm sm:text-base',
              state !== 'matched' && !locked && choicePress,
              choiceStyles[state],
            )}
          >
            <ChemText text={text} />
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <h2 className="text-xl font-extrabold sm:text-2xl">
        <ChemText text={question.prompt} />
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {renderColumn('left', leftOrder)}
        {renderColumn('right', rightOrder)}
      </div>
      <p className="text-center text-sm font-bold text-duo-muted">
        {matched.size}/{question.pairs.length} pares
        {mistakes > 0 && <span className="text-duo-red"> · {mistakes} {mistakes === 1 ? 'erro' : 'erros'}</span>}
      </p>
    </>
  );
}
