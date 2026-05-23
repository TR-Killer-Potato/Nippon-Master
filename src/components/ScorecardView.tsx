import React from "react";
import { AlertTriangle, ArrowLeft, RefreshCw, Star, Trash2, Zap } from "lucide-react";
import { ScorecardData } from "../lib/firebase";
import { allLessons, ExpandedLesson, ExpandedVocab } from "../data/lessons";

interface ScorecardViewProps {
  scorecard: ScorecardData;
  onClearScorecard: () => void;
  onPracticeMistakes: (customLesson: ExpandedLesson) => void;
  onBack: () => void;
}

export default function ScorecardView({ scorecard, onClearScorecard, onPracticeMistakes, onBack }: ScorecardViewProps) {
  
  // Aggregate mistakes list
  const activeMistakes: {
    word: string;
    lessonId: string;
    vocabObj: ExpandedVocab;
    modes: Record<string, number>;
    totalCount: number;
  }[] = [];

  Object.entries(scorecard.scores).forEach(([lessonId, vocabMap]) => {
    const origLesson = allLessons.find(l => l.id === lessonId);
    if (!origLesson) return;

    Object.entries(vocabMap).forEach(([word, modes]) => {
      const origVocab = origLesson.vocabulary.find(v => v.v === word);
      if (!origVocab) return;

      const totalCount = Object.values(modes).reduce((sum, val) => sum + val, 0);

      if (totalCount > 0) {
        activeMistakes.push({
          word,
          lessonId,
          vocabObj: origVocab,
          modes,
          totalCount
        });
      }
    });
  });

  const hasMistakes = activeMistakes.length > 0;

  // Let's create a custom "Lesson" dynamically matching only the mistake words
  // so the parent can pass it to the QuizView seamlessly!
  const handleLaunchPractice = () => {
    if (!hasMistakes) return;

    const dynamicVocabList: ExpandedVocab[] = activeMistakes.map(m => m.vocabObj);
    const customLesson: ExpandedLesson = {
      id: "Scorecard Review",
      title: "Targeted Mistakes Practice",
      vocabulary: dynamicVocabList
    };
    onPracticeMistakes(customLesson);
  };

  return (
    <div className="space-y-6" id="scorecard-view-root">
      {/* Top bar navigation */}
      <div className="flex items-center justify-between" id="scorecard-header-bar">
        <button
          type="button"
          id="btn-scorecard-back"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          Back to Dashboard
        </button>

        {hasMistakes && (
          <button
            type="button"
            id="btn-scorecard-clear"
            onClick={onClearScorecard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/25 bg-white/5 hover:bg-red-500/10 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Scorecard
          </button>
        )}
      </div>

      {hasMistakes ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="scorecard-content-grid">
          {/* Main list */}
          <div className="lg:col-span-2 space-y-4" id="scorecard-table-container">
            <div className="bg-[#0d0d0d] rounded-2xl border border-white/10 overflow-hidden shadow-2xl" id="table-card">
              <div className="p-4 border-b border-white/5 px-6" id="table-header">
                <h3 className="font-semibold text-gray-100 text-sm">Wrong Answer Ledger</h3>
              </div>
              <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto" id="ledger-rows">
                {activeMistakes.map((m, index) => (
                  <div key={`${m.lessonId}-${m.word}-${index}`} className="p-4 sm:p-6 flex items-center justify-between gap-4" id={`ledger-row-${index}`}>
                    <div className="space-y-1.5" id={`ledger-v-${index}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-100 font-bold text-lg font-sans">
                          {m.word}
                        </span>
                        <span className="text-[10px] bg-white/5 text-gray-400 border border-white/5 px-2 py-0.5 rounded-full font-mono">
                          {m.lessonId}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-400 space-y-0.5 font-sans" id={`ledger-details-${index}`}>
                        {m.vocabObj.r !== "-" && (
                          <p>
                            <span className="font-medium text-gray-500">Reading:</span> {m.vocabObj.r}
                          </p>
                        )}
                        <p>
                          <span className="font-medium text-gray-500">Meaning:</span> {m.vocabObj.m}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1.5" id={`ledger-count-block-${index}`}>
                      <span className="inline-flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full font-bold border border-red-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {m.totalCount} Error{m.totalCount > 1 ? "s" : ""}
                      </span>

                      {/* Display breakdown per quiz direction */}
                      <div className="text-[10px] text-gray-500 font-mono space-y-0.5" id={`ledger-modes-${index}`}>
                        {Object.entries(m.modes).map(([testMode, val]) => {
                          if (val === 0) return null;
                          return (
                            <div key={testMode}>
                              {testMode.replace("Vocab-", "Option-")}: {val}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action pane */}
          <div className="space-y-6" id="scorecard-actions-panel">
            <div className="bg-[#131313] text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-white/5" id="mistakes-practice-promo">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-4" id="promo-content">
                <div className="p-3 bg-white/5 text-amber-500 rounded-2xl w-fit border border-white/5">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="text-lg font-bold tracking-tight">Practice Mistakes Only</h4>
                  <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                    Review and quiz yourself exclusively on the <strong className="text-white">{activeMistakes.length} terms</strong> you historically failed. Correct answers will prune them from your ledger.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-start-targeted-mistakes"
                  onClick={handleLaunchPractice}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-2xl transition-all shadow-md cursor-pointer hover:text-black"
                >
                  <RefreshCw className="w-4 h-4 text-black" />
                  Targeted review
                </button>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-white/5 space-y-3" id="ledger-help-box">
              <h4 className="font-semibold text-gray-100 border-b border-white/5 pb-2 text-xs">Ledger Insights</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Nippon Master logs incorrect selections during testing dynamically. This forms a tailored scorecard allowing you to target your individual learning gaps directly.
              </p>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span>Eradicate all errors to master!</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-24 max-w-md mx-auto text-center space-y-4 bg-[#0d0d0d] rounded-3xl border border-white/10 p-8 shadow-2xl" id="empty-scorecard">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto border border-emerald-500/20">
            <Star className="w-6 h-6 fill-current text-amber-500" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-gray-100">Scorecard Pristine</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Superb! You have zero registered mistakes in your ledger. Everything is mastered.
            </p>
          </div>
          <button
            type="button"
            id="btn-empty-scorecard-back"
            onClick={onBack}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold shadow-md cursor-pointer hover:text-black"
          >
            Start studying
          </button>
        </div>
      )}
    </div>
  );
}
