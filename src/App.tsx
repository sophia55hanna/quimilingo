import { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { LessonView } from './components/Lesson/LessonView';
import { OutOfHeartsModal } from './components/Lesson/OutOfHeartsModal';
import { LearningMap } from './components/Map/LearningMap';
import { Navbar } from './components/Navbar';
import { ProfileView } from './components/Profile/ProfileView';
import { ReviewMode } from './components/Review/ReviewMode';
import { SidePanel } from './components/SidePanel';
import { useGame } from './context/GameContext';
import type { AppTab, StudySession } from './types/chemistry';

export default function App() {
  const { hearts, isLessonUnlocked } = useGame();
  const [tab, setTab] = useState<AppTab>('learn');
  const [session, setSession] = useState<StudySession | null>(null);
  /** Incrementado a cada sessão para remontar a LessonView do zero. */
  const [sessionKey, setSessionKey] = useState(0);
  const [noHearts, setNoHearts] = useState(false);

  // Impede a rolagem do fundo enquanto uma lição está aberta
  useEffect(() => {
    document.body.style.overflow = session ? 'hidden' : '';
  }, [session]);

  const startLesson = useCallback(
    (lessonId: string) => {
      if (!isLessonUnlocked(lessonId)) return;
      if (hearts <= 0) {
        setNoHearts(true);
        return;
      }
      setSession({ mode: 'lesson', lessonId });
      setSessionKey((k) => k + 1);
    },
    [hearts, isLessonUnlocked],
  );

  const startReview = useCallback((questionIds: string[], title: string) => {
    if (questionIds.length === 0) return;
    setSession({ mode: 'review', questionIds, title });
    setSessionKey((k) => k + 1);
  }, []);

  const goPractice = useCallback(() => {
    setSession(null);
    setNoHearts(false);
    setTab('review');
  }, []);

  const changeTab = (next: AppTab) => {
    setTab(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-duo-bg text-duo-text">
      <Navbar active={tab} onChange={changeTab} />

      <div className="md:pl-64">
        <Header />
        <div className="mx-auto flex max-w-5xl justify-center gap-12 px-4 pb-28 md:pb-12">
          <main className="w-full max-w-xl">
            {tab === 'learn' && <LearningMap onStartLesson={startLesson} />}
            {tab === 'review' && <ReviewMode onStartReview={startReview} />}
            {tab === 'profile' && <ProfileView />}
          </main>
          <SidePanel onStartLesson={startLesson} />
        </div>
      </div>

      {session && (
        <LessonView key={sessionKey} session={session} onClose={() => setSession(null)} onGoPractice={goPractice} />
      )}

      {noHearts && !session && <OutOfHeartsModal onPractice={goPractice} onClose={() => setNoHearts(false)} />}
    </div>
  );
}
