import React, { useState, useEffect } from "react";
import { Award, BookOpen, CheckSquare, Cloud, CloudOff, Flame, HelpCircle, Inbox, Milestone, RotateCcw, Sparkles, User as UserIcon } from "lucide-react";
import Dashboard from "./components/Dashboard";
import ReaderView from "./components/ReaderView";
import QuizView from "./components/QuizView";
import ScorecardView from "./components/ScorecardView";
import FlashcardDeck from "./components/FlashcardDeck";
import { ExpandedLesson, allLessons } from "./data/lessons";
import { 
  ScorecardData, 
  getLocalScorecard, 
  saveLocalScorecard, 
  fetchScorecardFromCloud, 
  syncScorecardToCloud,
  tryInitFirebase,
  signInWithGoogle
} from "./lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "reader" | "quiz" | "scorecard" | "study">("dashboard");
  const [selectedLesson, setSelectedLesson] = useState<ExpandedLesson | null>(null);
  const [scorecard, setScorecard] = useState<ScorecardData>(getLocalScorecard());
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Synchronize with Firestore cloud state asynchronously on startup
  useEffect(() => {
    let active = true;

    async function initializeAndSync() {
      // First, check if firebase configuration is available and trigger sign in
      const connection = await tryInitFirebase();
      if (!connection) return;

      if (!active) return;
      setIsSyncing(true);

      try {
        const cloudData = await fetchScorecardFromCloud();
        if (cloudData && active) {
          // Robust merge of cloud scorecards with local records
          // preferring higher error counts to avoid data loss on concurrent modifications
          const localScores = { ...getLocalScorecard().scores };
          
          Object.entries(cloudData.scores).forEach(([lessonId, vocabMap]) => {
            if (!localScores[lessonId]) {
              localScores[lessonId] = {};
            }
            Object.entries(vocabMap).forEach(([word, modes]) => {
              if (!localScores[lessonId][word]) {
                localScores[lessonId][word] = {};
              }
              Object.entries(modes).forEach(([mode, count]) => {
                const localCount = localScores[lessonId][word][mode] || 0;
                localScores[lessonId][word][mode] = Math.max(localCount, count);
              });
            });
          });

          const merged: ScorecardData = { scores: localScores };
          saveLocalScorecard(merged);
          setScorecard(merged);
          setIsCloudSynced(true);
          
          // Sync merged data back up to cloud
          await syncScorecardToCloud(merged);
        } else {
          // If cloud document doesn't exist yet, seed it with local state data
          const currentLocal = getLocalScorecard();
          if (Object.keys(currentLocal.scores).length > 0) {
            await syncScorecardToCloud(currentLocal);
          }
          setIsCloudSynced(true);
        }
      } catch (err) {
        console.warn("Could not load cloud sync, maintaining offline operations mode:", err);
      } finally {
        if (active) {
          setIsSyncing(false);
        }
      }
    }

    initializeAndSync();

    return () => {
      active = false;
    };
  }, []);

  // Set up Firebase auth observer
  useEffect(() => {
    let unsubscribe: () => void;
    async function setupAuth() {
      const connection = await tryInitFirebase();
      if (connection) {
        unsubscribe = onAuthStateChanged(connection.auth, (user) => {
          setUser(user);
        });
      }
    }
    setupAuth();
    return () => unsubscribe?.();
  }, []);

  // Helper to find original lesson ID of a vocabulary word
  const findOriginalLessonId = (word: string): string => {
    const found = allLessons.find(lesson => 
      lesson.vocabulary.some(vocab => vocab.v === word)
    );
    return found ? found.id : "";
  };

  // Update error count in scorecard
  const handleLogMistake = (lessonId: string, word: string, testMode: string) => {
    const targetLessonId = lessonId === "Scorecard Review" ? findOriginalLessonId(word) : lessonId;
    if (!targetLessonId) return;

    setScorecard((prev) => {
      // Deep clone scores to trigger clean state update rerenders
      const updatedScores = JSON.parse(JSON.stringify(prev.scores));
      
      if (!updatedScores[targetLessonId]) {
        updatedScores[targetLessonId] = {};
      }
      if (!updatedScores[targetLessonId][word]) {
        updatedScores[targetLessonId][word] = {};
      }
      
      const prevVal = updatedScores[targetLessonId][word][testMode] || 0;
      updatedScores[targetLessonId][word][testMode] = prevVal + 1;

      const updated: ScorecardData = { scores: updatedScores };
      saveLocalScorecard(updated);
      
      // Fire-and-forget background sync to Cloud Firestore
      syncScorecardToCloud(updated).then((success) => {
        if (success) setIsCloudSynced(true);
      });

      return updated;
    });
  };

  // Prune/decrement errors from scorecard when corrected
  const handleLogCorrect = (lessonId: string, word: string, testMode: string) => {
    // Only prune/decrement if we are practicing mistakes, i.e., lessonId is "Scorecard Review"
    if (lessonId !== "Scorecard Review") return;

    const targetLessonId = findOriginalLessonId(word);
    if (!targetLessonId) return;

    setScorecard((prev) => {
      const updatedScores = JSON.parse(JSON.stringify(prev.scores));
      
      if (updatedScores[targetLessonId] && updatedScores[targetLessonId][word]) {
        const prevVal = updatedScores[targetLessonId][word][testMode] || 0;
        if (prevVal > 0) {
          updatedScores[targetLessonId][word][testMode] = prevVal - 1;
          
          // Clean up if count reaches 0 for this mode
          if (updatedScores[targetLessonId][word][testMode] === 0) {
            delete updatedScores[targetLessonId][word][testMode];
          }

          // Clean up if there are no modes left for this word
          if (Object.keys(updatedScores[targetLessonId][word]).length === 0) {
            delete updatedScores[targetLessonId][word];
          }

          // Clean up if there are no words left in this lesson
          if (Object.keys(updatedScores[targetLessonId]).length === 0) {
            delete updatedScores[targetLessonId];
          }
        }
      }

      const updated: ScorecardData = { scores: updatedScores };
      saveLocalScorecard(updated);

      // Background sync with Cloud Storage
      syncScorecardToCloud(updated).then((success) => {
        if (success) setIsCloudSynced(true);
      });

      return updated;
    });
  };

  // Erase incorrect answers data from scorecard
  const handleClearScorecard = () => {
    const empty: ScorecardData = { scores: {} };
    setScorecard(empty);
    saveLocalScorecard(empty);
    setIsCloudSynced(false);
    
    syncScorecardToCloud(empty).then((success) => {
      if (success) setIsCloudSynced(true);
    });
  };

  // Set up selected custom lesson for mistakes training session
  const handlePracticeMistakes = (customLesson: ExpandedLesson) => {
    setSelectedLesson(customLesson);
    setCurrentView("quiz");
  };

  // Trigger quick transition from reading story directly to vocab quiz mode
  const handleTransitionToQuiz = () => {
    if (selectedLesson) {
      setCurrentView("quiz");
    }
  };

  // Count active ledger errors
  const activeMistakeCount: number = Object.values(scorecard.scores).reduce((sum: number, vocabMap) => {
    return sum + Object.values(vocabMap).reduce((vSum: number, modes) => {
      return vSum + Object.values(modes as Record<string, number>).reduce((mSum: number, val: number) => mSum + val, 0);
    }, 0);
  }, 0) as number;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col font-sans" id="applet-viewport">
      {/* Editorial aesthetic top navigation */}
      <nav className="bg-[#0d0d0d] border-b border-white/10 sticky top-0 z-50 shadow-md" id="main-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo & Stamp */}
          <div 
            onClick={() => {
              setCurrentView("dashboard");
              setSelectedLesson(null);
            }}
            className="flex items-center gap-2.5 cursor-pointer selection:bg-amber-500/20 group"
            id="nav-logo-group"
          >
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-black font-extrabold tracking-tighter text-lg group-hover:scale-105 transition-all">
              日
            </div>
            <div>
              <span className="font-light tracking-widest text-gray-100 text-base sm:text-xl font-sans flex items-center gap-1 uppercase">
                Nippon <span className="text-amber-500 font-semibold">Master</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              </span>
              <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Japanese Learning Core</p>
            </div>
          </div>

          {/* User state and shortcut badges */}
          <div className="flex items-center gap-3 sm:gap-4" id="nav-actions-group">
            {/* Ledger count quicklink */}
            <button
              type="button"
              id="btn-nav-ledger-shortcut"
              onClick={() => setCurrentView("scorecard")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                activeMistakeCount > 0 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Scorecard:</span>
              <strong className="font-bold">{activeMistakeCount}</strong>
            </button>

            {/* Cloud connection feedback marker */}
            <div id="connection-indicator">
              {isSyncing ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                  <RotateCcw className="w-3 h-3 animate-spin text-amber-500" />
                  Syncing...
                </span>
              ) : isCloudSynced ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-mono">
                  <Cloud className="w-3 h-3" />
                  Cloud Backup
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg font-mono" title="Scores saved locally">
                  <CloudOff className="w-3 h-3" />
                  Local Save
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12" id="applet-main-canvas">
        {currentView === "dashboard" && (
          <Dashboard 
            scorecard={scorecard}
            user={user}
            onSignIn={signInWithGoogle}
            onSelectLesson={(lesson, mode) => {
              setSelectedLesson(lesson);
              setCurrentView(mode);
            }}
            onNavigateToScorecard={() => setCurrentView("scorecard")}
          />
        )}

        {currentView === "reader" && selectedLesson && (
          <ReaderView 
            lesson={selectedLesson}
            onBack={() => {
              setCurrentView("dashboard");
              setSelectedLesson(null);
            }}
            onStartQuiz={handleTransitionToQuiz}
          />
        )}

        {currentView === "quiz" && selectedLesson && (
          <QuizView 
            lesson={selectedLesson}
            onBack={() => {
              setCurrentView("dashboard");
              setSelectedLesson(null);
            }}
            onLogMistake={handleLogMistake}
            onLogCorrect={handleLogCorrect}
          />
        )}

        {currentView === "study" && selectedLesson && (
          <FlashcardDeck 
            lesson={selectedLesson}
            onBack={() => {
              setCurrentView("dashboard");
              setSelectedLesson(null);
            }}
          />
        )}

        {currentView === "scorecard" && (
          <ScorecardView 
            scorecard={scorecard}
            onClearScorecard={handleClearScorecard}
            onPracticeMistakes={handlePracticeMistakes}
            onBack={() => {
              setCurrentView("dashboard");
              setSelectedLesson(null);
            }}
          />
        )}
      </main>

      {/* Footer copyright */}
      <footer className="bg-[#0d0d0d] border-t border-white/10 py-6 text-center text-gray-500 text-xs mt-auto" id="footer-credits">
        <p className="font-sans">© {new Date().getFullYear()} Nippon Master Japanese Platform. Made with standard React &amp; Tailwind CSS.</p>
        <p className="font-mono text-[9px] text-gray-600 mt-1">Version 2.4.0 • Zero-Trust Firebase Integration Active</p>
      </footer>
    </div>
  );
}
