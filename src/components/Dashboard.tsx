import React, { useState } from "react";
import { BookOpen, Award, CheckCircle2, AlertTriangle, Play, Flame, Search, Sparkles } from "lucide-react";
import { ExpandedLesson, allLessons } from "../data/lessons";
import { ScorecardData } from "../lib/firebase";

interface DashboardProps {
  scorecard: ScorecardData;
  onSelectLesson: (lesson: ExpandedLesson, mode: "reader" | "quiz" | "study") => void;
  onNavigateToScorecard: () => void;
}

export default function Dashboard({ scorecard, onSelectLesson, onNavigateToScorecard }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "completed" | "progress">("all");

  // Calculate stats
  const totalLessons = allLessons.length;
  
  // Count total vocabulary items across all lessons
  const totalVocabCount = allLessons.reduce((sum, lesson) => sum + lesson.vocabulary.length, 0);

  // Count active errors registered in the scorecard
  let totalErrors = 0;
  const mistakenWordsList: { word: string; lesson: string; count: number }[] = [];

  Object.entries(scorecard.scores).forEach(([lessonId, vocabMap]) => {
    Object.entries(vocabMap).forEach(([word, modes]) => {
      const errorCountForWord = Object.values(modes).reduce((a, b) => a + b, 0);
      if (errorCountForWord > 0) {
        totalErrors += errorCountForWord;
        mistakenWordsList.push({
          word,
          lesson: lessonId,
          count: errorCountForWord
        });
      }
    });
  });

  // Unique lessons attempted (having records in scorecard)
  const attemptedLessonsCount = Object.keys(scorecard.scores).length;
  const attemptedLessonsList = Object.keys(scorecard.scores);

  // Filter lessons based on search and category
  const filteredLessons = allLessons.filter((lesson) => {
    const matchesSearch = lesson.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isAttempted = attemptedLessonsList.includes(lesson.id);
    
    if (selectedCategory === "completed") {
      // Deemed completed if attempted and no mistakes exist currently for this lesson
      const lessonScores = scorecard.scores[lesson.id] || {};
      const hasErrors = Object.values(lessonScores).some(modes => 
        Object.values(modes).some(v => v > 0)
      );
      return matchesSearch && isAttempted && !hasErrors;
    }
    
    if (selectedCategory === "progress") {
      return matchesSearch && isAttempted;
    }
    
    return matchesSearch;
  });

  return (
    <div className="space-y-8" id="dashboard-root">
      {/* Visual Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-stone-900/40 to-black/80 rounded-3xl p-8 md:p-12 text-gray-200 border border-white/10 shadow-2xl" id="hero-banner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-950/40 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl" id="hero-content">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 backdrop-blur-md rounded-full text-xs font-medium tracking-wide text-amber-400 mb-4 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Learn Japanese Vocab & Reading
          </div>
          <h1 className="text-3xl md:text-5xl font-extralight tracking-tight mb-4 font-sans leading-tight">
            Nippon <span className="text-amber-500 font-semibold">Master</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg mb-6 leading-relaxed">
            Enhance your vocabulary, reading grasp, and overall speed. Complete the 22 core modules of modern Japanese communication.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10" id="hero-mini-stats">
            <div>
              <div className="text-2xl font-light text-amber-500">{attemptedLessonsCount}/22</div>
              <div className="text-xs text-gray-500 uppercase font-mono tracking-wider">Lessons Practiced</div>
            </div>
            <div>
              <div className="text-2xl font-light text-amber-500">{totalVocabCount}</div>
              <div className="text-xs text-gray-500 uppercase font-mono tracking-wider">Core Vocabulary</div>
            </div>
            <div>
              <div className="text-2xl font-light text-amber-400 flex items-center gap-1">
                <Flame className="w-5 h-5 fill-current text-amber-500" />
                {attemptedLessonsCount > 0 ? "Active" : "Ready"}
              </div>
              <div className="text-xs text-gray-500 uppercase font-mono tracking-wider">Study Streak</div>
            </div>
            <div>
              <div className="text-2xl font-light text-red-400">{totalErrors}</div>
              <div className="text-xs text-gray-500 uppercase font-mono tracking-wider">Active Errors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Scorecard Summary Notification */}
      {totalErrors > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl transition-all" id="summary-alert">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-400 text-sm">Review Mistaken Words</h4>
              <p className="text-xs text-gray-400 leading-normal">
                You have recorded <strong className="font-bold text-amber-500">{totalErrors} mistakes</strong> on vocabulary tests. Retake quizzes to overwrite and thin out this registry!
              </p>
            </div>
          </div>
          <button 
            type="button"
            id="btn-goto-scorecard"
            onClick={onNavigateToScorecard} 
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-bold whitespace-nowrap shadow-md shadow-amber-500/5 transition-all cursor-pointer"
          >
            Review scorecard
          </button>
        </div>
      )}

      {/* Grid Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/10 pb-5" id="filter-bar">
        {/* Category togglers */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl shrink-0 border border-white/5" id="filter-category-toggles">
          <button
            type="button"
            id="btn-filter-all"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedCategory === "all" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-gray-400 hover:text-white"}`}
          >
            All Lessons
          </button>
          <button
            type="button"
            id="btn-filter-progress"
            onClick={() => setSelectedCategory("progress")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedCategory === "progress" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-gray-400 hover:text-white"}`}
          >
            Attempted
          </button>
          <button
            type="button"
            id="btn-filter-completed"
            onClick={() => setSelectedCategory("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${selectedCategory === "completed" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-gray-400 hover:text-white"}`}
          >
            Mastered Modules
          </button>
        </div>

        {/* Search tool */}
        <div className="relative w-full md:max-w-xs" id="search-container">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            id="input-search-lessons"
            placeholder="Search cards/lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans text-gray-200 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" id="lessons-grid">
        {filteredLessons.map((lesson) => {
          const isAttempted = attemptedLessonsList.includes(lesson.id);
          
          // Calculate specific lesson scores
          const lessonScores = scorecard.scores[lesson.id] || {};
          let lessonErrCount = 0;
          Object.values(lessonScores).forEach(modes => {
            lessonErrCount += Object.values(modes).reduce((a, b) => a + b, 0);
          });

          return (
            <div 
              key={lesson.id} 
              id={`card-${lesson.id.replace(" ", "-")}`}
              className="group bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-2xl border border-white/5 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/5 p-5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3" id={`card-body-${lesson.id.replace(" ", "-")}`}>
                <div className="flex items-start justify-between" id={`card-heading-${lesson.id.replace(" ", "-")}`}>
                  <span className="text-[10px] font-bold tracking-widest text-amber-500/60 font-mono uppercase">
                    {lesson.id}
                  </span>
                  
                  {isAttempted ? (
                    lessonErrCount === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Mastered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full font-semibold border border-red-500/20 font-mono">
                        {lessonErrCount} Error{lessonErrCount > 1 ? "s" : ""}
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full font-medium border border-white/5">
                      Not started
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-200 group-hover:text-amber-500 transition-colors text-base font-sans">
                    {lesson.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1 font-mono">
                    {lesson.vocabulary.length} core vocabulary cards
                  </p>
                </div>
              </div>

              {/* Interaction Launchers */}
              <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-white/5 justify-between" id={`card-actions-${lesson.id.replace(" ", "-")}`}>
                <button
                  type="button"
                  id={`btn-read-${lesson.id.replace(" ", "-")}`}
                  onClick={() => onSelectLesson(lesson, "reader")}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-semibold rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  Read
                </button>
                <button
                  type="button"
                  id={`btn-study-${lesson.id.replace(" ", "-")}`}
                  onClick={() => onSelectLesson(lesson, "study")}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[11px] font-semibold rounded-xl border border-amber-500/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                  Study
                </button>
                <button
                  type="button"
                  id={`btn-quiz-${lesson.id.replace(" ", "-")}`}
                  onClick={() => onSelectLesson(lesson, "quiz")}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-bold rounded-xl transition-all shadow-md shadow-amber-500/5 cursor-pointer"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  Quiz
                </button>
              </div>
            </div>
          );
        })}

        {filteredLessons.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500" id="no-filtered-lessons">
            <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-sm">No courses matching your search filter were found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
