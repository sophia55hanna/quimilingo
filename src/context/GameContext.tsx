import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { allLessons, lessonsById, questionsById } from '../data/chemistryData';
import { playSound as playSoundRaw } from '../lib/sound';
import { addDays, clamp, toDateKey } from '../lib/utils';
import type { LessonResult, MistakeEntry, SoundName, UserProgress } from '../types/chemistry';

export const MAX_HEARTS = 15;
/** Limite usado por saves antigos que não registravam `maxHearts`. */
const LEGACY_MAX_HEARTS = 5;
export const HEART_REFILL_MS = 30 * 60 * 1000;
export const DAILY_XP_GOAL = 30;
/** XP base ao refazer uma lição já concluída. */
export const REPLAY_XP = 5;
const STORAGE_KEY = 'quimilingo:progress:v1';
const MAX_STUDY_DAYS = 60;

// ---------------------------------------------------------------------------
// Funções puras de estado
// ---------------------------------------------------------------------------

function createDefaultProgress(now = Date.now()): UserProgress {
  return {
    version: 1,
    hearts: MAX_HEARTS,
    maxHearts: MAX_HEARTS,
    lastHeartUpdate: now,
    xp: 0,
    streak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    studyDays: [],
    dailyXp: { date: toDateKey(now), xp: 0 },
    completedLessons: {},
    mistakes: {},
    soundEnabled: true,
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isDateKey = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Valida e normaliza dados vindos do LocalStorage (que podem estar corrompidos ou desatualizados). */
function sanitizeProgress(raw: unknown, now = Date.now()): UserProgress {
  const fallback = createDefaultProgress(now);
  if (!isRecord(raw)) return fallback;

  const completedLessons: Record<string, LessonResult> = {};
  if (isRecord(raw.completedLessons)) {
    for (const [lessonId, value] of Object.entries(raw.completedLessons)) {
      if (!lessonsById.has(lessonId) || !isRecord(value)) continue;
      completedLessons[lessonId] = {
        bestAccuracy: isFiniteNumber(value.bestAccuracy) ? clamp(value.bestAccuracy, 0, 1) : 0,
        timesCompleted: isFiniteNumber(value.timesCompleted) ? Math.max(1, Math.floor(value.timesCompleted)) : 1,
        lastCompletedAt: isFiniteNumber(value.lastCompletedAt) ? value.lastCompletedAt : now,
      };
    }
  }

  const mistakes: Record<string, MistakeEntry> = {};
  if (isRecord(raw.mistakes)) {
    for (const [questionId, value] of Object.entries(raw.mistakes)) {
      const ref = questionsById.get(questionId);
      if (!ref || !isRecord(value)) continue;
      mistakes[questionId] = {
        questionId,
        lessonId: ref.lessonId,
        count: isFiniteNumber(value.count) ? Math.max(1, Math.floor(value.count)) : 1,
        lastMissedAt: isFiniteNumber(value.lastMissedAt) ? value.lastMissedAt : now,
      };
    }
  }

  const dailyXp =
    isRecord(raw.dailyXp) && isDateKey(raw.dailyXp.date) && isFiniteNumber(raw.dailyXp.xp)
      ? { date: raw.dailyXp.date, xp: Math.max(0, Math.floor(raw.dailyXp.xp)) }
      : fallback.dailyXp;

  const streak = isFiniteNumber(raw.streak) ? Math.max(0, Math.floor(raw.streak)) : 0;

  // Se o limite de vidas aumentou desde o último save, o jogador ganha a diferença
  // (mantendo as vidas que já tinha perdido).
  const storedMax = isFiniteNumber(raw.maxHearts) ? raw.maxHearts : LEGACY_MAX_HEARTS;
  const storedHearts = isFiniteNumber(raw.hearts) ? Math.floor(raw.hearts) : storedMax;
  const hearts = clamp(storedHearts + Math.max(0, MAX_HEARTS - storedMax), 0, MAX_HEARTS);

  return {
    version: 1,
    hearts,
    maxHearts: MAX_HEARTS,
    lastHeartUpdate: isFiniteNumber(raw.lastHeartUpdate) ? Math.min(raw.lastHeartUpdate, now) : now,
    xp: isFiniteNumber(raw.xp) ? Math.max(0, Math.floor(raw.xp)) : 0,
    streak,
    longestStreak: isFiniteNumber(raw.longestStreak) ? Math.max(streak, Math.floor(raw.longestStreak)) : streak,
    lastStudyDate: isDateKey(raw.lastStudyDate) ? raw.lastStudyDate : null,
    studyDays: Array.isArray(raw.studyDays) ? raw.studyDays.filter(isDateKey).slice(-MAX_STUDY_DAYS) : [],
    dailyXp,
    completedLessons,
    mistakes,
    soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : true,
  };
}

function loadProgress(): UserProgress {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return regenerateHearts(createDefaultProgress(), Date.now());
    return regenerateHearts(sanitizeProgress(JSON.parse(stored)), Date.now());
  } catch {
    return createDefaultProgress();
  }
}

function saveProgress(progress: UserProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Armazenamento indisponível (modo privado / cota cheia): o app segue funcionando em memória.
  }
}

/** Regenera 1 vida a cada HEART_REFILL_MS. Retorna o mesmo objeto se nada mudou. */
function regenerateHearts(progress: UserProgress, now: number): UserProgress {
  if (progress.hearts >= MAX_HEARTS) return progress;
  const elapsed = now - progress.lastHeartUpdate;
  const gained = Math.floor(elapsed / HEART_REFILL_MS);
  if (gained <= 0) return progress;
  const hearts = Math.min(MAX_HEARTS, progress.hearts + gained);
  return {
    ...progress,
    hearts,
    lastHeartUpdate: hearts >= MAX_HEARTS ? now : progress.lastHeartUpdate + gained * HEART_REFILL_MS,
  };
}

/** Registra um dia de estudo e atualiza a ofensiva. */
function registerStudy(progress: UserProgress, now: number): UserProgress {
  const today = toDateKey(now);
  if (progress.lastStudyDate === today) return progress;
  const yesterday = toDateKey(addDays(now, -1));
  const streak = progress.lastStudyDate === yesterday ? progress.streak + 1 : 1;
  return {
    ...progress,
    streak,
    longestStreak: Math.max(progress.longestStreak, streak),
    lastStudyDate: today,
    studyDays: [...progress.studyDays.filter((d) => d !== today), today].slice(-MAX_STUDY_DAYS),
  };
}

function addXp(progress: UserProgress, amount: number, now: number): UserProgress {
  const today = toDateKey(now);
  const dailyBase = progress.dailyXp.date === today ? progress.dailyXp.xp : 0;
  return {
    ...progress,
    xp: progress.xp + amount,
    dailyXp: { date: today, xp: dailyBase + amount },
  };
}

function getEffectiveStreak(progress: UserProgress, now: number): number {
  if (!progress.lastStudyDate) return 0;
  const today = toDateKey(now);
  const yesterday = toDateKey(addDays(now, -1));
  return progress.lastStudyDate === today || progress.lastStudyDate === yesterday ? progress.streak : 0;
}

// ---------------------------------------------------------------------------
// Contexto
// ---------------------------------------------------------------------------

export interface CompletionResult {
  streakExtended: boolean;
  streak: number;
}

interface GameContextValue {
  progress: UserProgress;
  hearts: number;
  xp: number;
  streak: number;
  studiedToday: boolean;
  dailyXp: number;
  /** Timestamp da próxima vida regenerada (null se estiver com vidas cheias). */
  nextHeartAt: number | null;
  mistakeCount: number;
  completedCount: number;
  /** Primeira lição ainda não concluída (null se tudo foi concluído). */
  currentLessonId: string | null;
  isLessonCompleted: (lessonId: string) => boolean;
  isLessonUnlocked: (lessonId: string) => boolean;
  loseHeart: () => void;
  gainHearts: (amount: number) => void;
  recordMistake: (questionId: string) => void;
  resolveMistake: (questionId: string) => void;
  completeLesson: (lessonId: string, accuracy: number, xpEarned: number) => CompletionResult;
  completeReview: (xpEarned: number, heartsRestored: number) => CompletionResult;
  toggleSound: () => void;
  playSound: (name: SoundName) => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [now, setNow] = useState(() => Date.now());
  const progressRef = useRef(progress);
  progressRef.current = progress;

  // Persistência automática
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Relógio para regeneração de vidas e virada de dia
  useEffect(() => {
    const id = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      setProgress((p) => regenerateHearts(p, current));
    }, 10_000);
    return () => window.clearInterval(id);
  }, []);

  // Sincroniza entre abas abertas
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        setProgress(sanitizeProgress(JSON.parse(event.newValue)));
      } catch {
        // Ignora valores inválidos escritos por outra aba.
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const playSound = useCallback((name: SoundName) => {
    if (progressRef.current.soundEnabled) playSoundRaw(name);
  }, []);

  const isLessonCompleted = useCallback(
    (lessonId: string) => Boolean(progress.completedLessons[lessonId]),
    [progress.completedLessons],
  );

  const isLessonUnlocked = useCallback(
    (lessonId: string) => {
      const ref = lessonsById.get(lessonId);
      if (!ref) return false;
      if (ref.order === 0 || progress.completedLessons[lessonId]) return true;
      const previous = allLessons[ref.order - 1];
      return Boolean(progress.completedLessons[previous.lesson.id]);
    },
    [progress.completedLessons],
  );

  const loseHeart = useCallback(() => {
    setProgress((p) => {
      if (p.hearts <= 0) return p;
      const current = Date.now();
      return {
        ...p,
        hearts: p.hearts - 1,
        // Ao sair de vidas cheias, o cronômetro de regeneração começa agora.
        lastHeartUpdate: p.hearts >= MAX_HEARTS ? current : p.lastHeartUpdate,
      };
    });
  }, []);

  const gainHearts = useCallback((amount: number) => {
    setProgress((p) => {
      const hearts = Math.min(MAX_HEARTS, p.hearts + amount);
      return hearts === p.hearts ? p : { ...p, hearts, lastHeartUpdate: hearts >= MAX_HEARTS ? Date.now() : p.lastHeartUpdate };
    });
  }, []);

  const recordMistake = useCallback((questionId: string) => {
    const ref = questionsById.get(questionId);
    if (!ref) return;
    setProgress((p) => {
      const existing = p.mistakes[questionId];
      return {
        ...p,
        mistakes: {
          ...p.mistakes,
          [questionId]: {
            questionId,
            lessonId: ref.lessonId,
            count: (existing?.count ?? 0) + 1,
            lastMissedAt: Date.now(),
          },
        },
      };
    });
  }, []);

  const resolveMistake = useCallback((questionId: string) => {
    setProgress((p) => {
      if (!p.mistakes[questionId]) return p;
      const { [questionId]: _removed, ...rest } = p.mistakes;
      return { ...p, mistakes: rest };
    });
  }, []);

  const computeCompletion = (): CompletionResult => {
    const current = Date.now();
    const snapshot = progressRef.current;
    const today = toDateKey(current);
    if (snapshot.lastStudyDate === today) return { streakExtended: false, streak: snapshot.streak };
    const yesterday = toDateKey(addDays(current, -1));
    const streak = snapshot.lastStudyDate === yesterday ? snapshot.streak + 1 : 1;
    return { streakExtended: true, streak };
  };

  const completeLesson = useCallback((lessonId: string, accuracy: number, xpEarned: number): CompletionResult => {
    const result = computeCompletion();
    setProgress((p) => {
      const current = Date.now();
      const previous = p.completedLessons[lessonId];
      const withLesson: UserProgress = {
        ...p,
        completedLessons: {
          ...p.completedLessons,
          [lessonId]: {
            bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, accuracy),
            timesCompleted: (previous?.timesCompleted ?? 0) + 1,
            lastCompletedAt: current,
          },
        },
      };
      return registerStudy(addXp(withLesson, xpEarned, current), current);
    });
    return result;
  }, []);

  const completeReview = useCallback((xpEarned: number, heartsRestored: number): CompletionResult => {
    const result = computeCompletion();
    setProgress((p) => {
      const current = Date.now();
      const hearts = Math.min(MAX_HEARTS, p.hearts + heartsRestored);
      const withHearts: UserProgress = {
        ...p,
        hearts,
        lastHeartUpdate: hearts >= MAX_HEARTS ? current : p.lastHeartUpdate,
      };
      return registerStudy(addXp(withHearts, xpEarned, current), current);
    });
    return result;
  }, []);

  const toggleSound = useCallback(() => {
    setProgress((p) => ({ ...p, soundEnabled: !p.soundEnabled }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(createDefaultProgress());
  }, []);

  const value = useMemo<GameContextValue>(() => {
    const currentLesson = allLessons.find((ref) => !progress.completedLessons[ref.lesson.id]);
    const today = toDateKey(now);
    return {
      progress,
      hearts: progress.hearts,
      xp: progress.xp,
      streak: getEffectiveStreak(progress, now),
      studiedToday: progress.lastStudyDate === today,
      dailyXp: progress.dailyXp.date === today ? progress.dailyXp.xp : 0,
      nextHeartAt: progress.hearts >= MAX_HEARTS ? null : progress.lastHeartUpdate + HEART_REFILL_MS,
      mistakeCount: Object.keys(progress.mistakes).length,
      completedCount: Object.keys(progress.completedLessons).length,
      currentLessonId: currentLesson?.lesson.id ?? null,
      isLessonCompleted,
      isLessonUnlocked,
      loseHeart,
      gainHearts,
      recordMistake,
      resolveMistake,
      completeLesson,
      completeReview,
      toggleSound,
      playSound,
      resetProgress,
    };
  }, [
    progress,
    now,
    isLessonCompleted,
    isLessonUnlocked,
    loseHeart,
    gainHearts,
    recordMistake,
    resolveMistake,
    completeLesson,
    completeReview,
    toggleSound,
    playSound,
    resetProgress,
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame deve ser usado dentro de <GameProvider>.');
  return ctx;
}
