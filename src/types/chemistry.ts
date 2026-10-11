// ---------------------------------------------------------------------------
// Conteúdo pedagógico
// ---------------------------------------------------------------------------

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'match-pairs';

interface QuestionBase {
  id: string;
  type: QuestionType;
  /** Explicação exibida após a resposta (acerto ou erro). Aceita fórmulas entre `$...$`. */
  explanation: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple-choice';
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'true-false';
  statement: string;
  answer: boolean;
}

export interface FillBlankQuestion extends QuestionBase {
  type: 'fill-blank';
  prompt: string;
  /** Frase com lacunas marcadas por `___`. */
  template: string;
  /** Banco de termos (inclui as respostas e distratores). */
  options: string[];
  /** Respostas na ordem em que as lacunas aparecem no template. */
  answers: string[];
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface MatchPairsQuestion extends QuestionBase {
  type: 'match-pairs';
  prompt: string;
  pairs: MatchPair[];
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | MatchPairsQuestion;

export type ModuleColor =
  | 'green'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'teal'
  | 'indigo'
  | 'sky'
  | 'amber'
  | 'rose'
  | 'lime';

export type ModuleIcon =
  | 'flask'
  | 'atom'
  | 'layers'
  | 'grid'
  | 'link'
  | 'droplet'
  | 'book'
  | 'test-tube'
  | 'gem'
  | 'wind'
  | 'palette';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  questions: Question[];
}

export interface Module {
  id: string;
  number: number;
  title: string;
  description: string;
  color: ModuleColor;
  icon: ModuleIcon;
  lessons: Lesson[];
}

/** Lição achatada com metadados de posição na trilha. */
export interface LessonRef {
  lesson: Lesson;
  module: Module;
  /** Índice global na trilha (0-based). */
  order: number;
}

export interface QuestionRef {
  question: Question;
  lessonId: string;
  moduleId: string;
}

// ---------------------------------------------------------------------------
// Progresso do usuário
// ---------------------------------------------------------------------------

export interface LessonResult {
  bestAccuracy: number;
  timesCompleted: number;
  lastCompletedAt: number;
}

export interface MistakeEntry {
  questionId: string;
  lessonId: string;
  count: number;
  lastMissedAt: number;
}

export interface DailyXp {
  date: string;
  xp: number;
}

export interface UserProgress {
  version: 1;
  hearts: number;
  /** Limite de vidas vigente quando o progresso foi salvo (usado para migrar saves antigos). */
  maxHearts: number;
  /** Marco temporal a partir do qual a regeneração de vidas é contada. */
  lastHeartUpdate: number;
  xp: number;
  streak: number;
  longestStreak: number;
  /** Data local (YYYY-MM-DD) do último estudo. */
  lastStudyDate: string | null;
  /** Dias estudados (YYYY-MM-DD), mantidos os mais recentes. */
  studyDays: string[];
  dailyXp: DailyXp;
  completedLessons: Record<string, LessonResult>;
  mistakes: Record<string, MistakeEntry>;
  soundEnabled: boolean;
}

// ---------------------------------------------------------------------------
// UI / sessão
// ---------------------------------------------------------------------------

export type ExerciseStatus = 'idle' | 'correct' | 'wrong';

export type AppTab = 'learn' | 'review' | 'profile';

export type SessionMode = 'lesson' | 'review';

export type StudySession =
  | { mode: 'lesson'; lessonId: string }
  | { mode: 'review'; questionIds: string[]; title: string };

export interface SessionSummary {
  mode: SessionMode;
  xpEarned: number;
  baseXp: number;
  bonusXp: number;
  accuracy: number;
  durationMs: number;
  bestCombo: number;
  totalQuestions: number;
  streakExtended: boolean;
  streak: number;
  heartsRestored: number;
}

export type SoundName = 'correct' | 'wrong' | 'complete' | 'click' | 'match';
