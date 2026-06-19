import React, { useState } from "react";
import { BookOpen, Award, CheckCircle2, AlertTriangle, Play, Flame, Search, Sparkles, User as UserIcon, ChevronDown, ChevronUp, Grid, Milestone, Compass } from "lucide-react";
import { ExpandedLesson, allLessons } from "../data/lessons";
import { ScorecardData } from "../lib/firebase";
import { User } from "firebase/auth";

interface DashboardProps {
  scorecard: ScorecardData;
  user: User | null;
  onSignIn: () => void;
  onSelectLesson: (lesson: ExpandedLesson, mode: "reader" | "quiz" | "study") => void;
  onNavigateToScorecard: () => void;
}

interface UnitGroup {
  id: number;
  name: string;
  description: string;
  lessonIds: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const UNITS: UnitGroup[] = [
  {
    id: 1,
    name: "Foundations & Greetings",
    description: "Begin with standard polite greetings, basic pronouns, nouns, and Japanese script structures.",
    lessonIds: ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4", "Lesson 5"],
    icon: BookOpen,
  },
  {
    id: 2,
    name: "Daily Routine & Navigation",
    description: "Navigate physical locations, identify immediate spaces, and purchase common essentials.",
    lessonIds: ["Lesson 6", "Lesson 7", "Lesson 8", "Lesson 9", "Lesson 10"],
    icon: Compass,
  },
  {
    id: 3,
    name: "Adjectives & Personal Desires",
    description: "Introduce descriptive words and discuss personal preferences, lifestyle, and meal times.",
    lessonIds: ["Lesson 11", "Lesson 12", "Lesson 13", "Lesson 14"],
    icon: Sparkles,
  },
  {
    id: 4,
    name: "Continuous Actions & TE-Form Commands",
    description: "Connect multiple operations, command sequences, and state rules using the versatile verb te-form.",
    lessonIds: ["Lesson 15", "Lesson 16", "Lesson 17", "Lesson 18"],
    icon: Flame,
  },
  {
    id: 5,
    name: "Advanced Capability & Fluent Nuance",
    description: "Convey capability, give informal explanations/justifications, and master conversational fluency.",
    lessonIds: ["Lesson 19", "Lesson 20", "Lesson 21", "Lesson 22"],
    icon: Award,
  }
];

export default function Dashboard({ scorecard, user, onSignIn, onSelectLesson, onNavigateToScorecard }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "completed" | "progress">("all");
  const [viewMode, setViewMode] = useState<"pathway" | "classic">(() => {
    const saved = localStorage.getItem("nippon_dashboard_view_mode");
    return (saved === "classic" || saved === "pathway") ? saved : "pathway";
  });

  // Unique lessons attempted (having records in scorecard)
  const attemptedLessonsList = Object.keys(scorecard.scores);
  const attemptedLessonsCount = attemptedLessonsList.length;

  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>(() => {
    // By default, expand the first unit that has uncompleted lessons
    const firstActiveUnit = UNITS.findIndex(unit => {
      return unit.lessonIds.some(lId => {
        const isAttempted = attemptedLessonsList.includes(lId);
        const lessonScores = scorecard.scores[lId] || {};
        const hasErrors = Object.values(lessonScores).some(modes => 
          Object.values(modes).some(v => v > 0)
        );
        return !isAttempted || hasErrors;
      });
    });
    
    const initialIdx = firstActiveUnit !== -1 ? firstActiveUnit : 0;
    return { [initialIdx]: true };
  });

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const setAndSaveViewMode = (mode: "pathway" | "classic") => {
    setViewMode(mode);
    localStorage.setItem("nippon_dashboard_view_mode", mode);
  };

  // Keep track of stats
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

  // Help render a card for a lesson
  const renderLessonCard = (lesson: ExpandedLesson) => {
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
                <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full font-semibold border border-red-500/20 font-mono font-bold">
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
  };

  // Determine if we should show the Unit-based Pathway or fall back to Classic Grid view
  const isSearchActive = searchTerm !== "";
  const isCategoryFilterActive = selectedCategory !== "all";
  const showPathway = viewMode === "pathway" && !isSearchActive && !isCategoryFilterActive;

  return (
    <div className="space-y-8" id="dashboard-root">
      {/* Visual Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-stone-900/40 to-black/80 rounded-3xl p-8 md:p-12 text-gray-200 border border-white/10 shadow-2xl" id="hero-banner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-950/40 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl" id="hero-content">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 backdrop-blur-md rounded-full text-xs font-medium tracking-wide text-amber-400 mb-4 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Learn Japanese Vocab & Reading
            </div>
            {!user && (
              <button
                type="button"
                onClick={onSignIn}
                className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium text-gray-300 mb-4 border border-white/10 transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign in to sync
              </button>
            )}
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

      {/* Grid Filter Bar: Integrated Categories, Views & Queries */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-white/10 pb-5" id="filter-bar">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Category togglers */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl shrink-0 border border-white/5 w-full sm:w-auto" id="filter-category-toggles">
            <button
              type="button"
              id="btn-filter-all"
              onClick={() => setSelectedCategory("all")}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${selectedCategory === "all" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-gray-400 hover:text-white"}`}
            >
              All Lessons
            </button>
            <button
              type="button"
              id="btn-filter-progress"
              onClick={() => setSelectedCategory("progress")}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${selectedCategory === "progress" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-gray-400 hover:text-white"}`}
            >
              Attempted
            </button>
            <button
              type="button"
              id="btn-filter-completed"
              onClick={() => setSelectedCategory("completed")}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${selectedCategory === "completed" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-gray-400 hover:text-white"}`}
            >
              Mastered
            </button>
          </div>

          <div className="hidden sm:block h-6 w-px bg-white/10" />

          {/* View mode layout selectors */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl shrink-0 border border-white/5 w-full sm:w-auto" id="view-mode-selector">
            <button
              type="button"
              id="btn-view-pathway"
              onClick={() => setAndSaveViewMode("pathway")}
              className={`flex-grow sm:flex-grow-0 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${viewMode === "pathway" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-gray-400 hover:text-white"}`}
            >
              <Milestone className="w-3.5 h-3.5" />
              Units Roadmap
            </button>
            <button
              type="button"
              id="btn-view-classic"
              onClick={() => setAndSaveViewMode("classic")}
              className={`flex-grow sm:flex-grow-0 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${viewMode === "classic" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-gray-400 hover:text-white"}`}
            >
              <Grid className="w-3.5 h-3.5" />
              Grid View
            </button>
          </div>
        </div>

        {/* Search tool */}
        <div className="relative w-full lg:max-w-xs" id="search-container">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            id="input-search-lessons"
            placeholder="Search lessons/words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans text-gray-200 placeholder-gray-500"
          />
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO VIEW SELECTIONS */}
      {showPathway ? (
        // ACCORDION ROADMAP
        <div className="space-y-4 animate-fade-in" id="units-wrapper">
          {UNITS.map((unit) => {
            const UnitIcon = unit.icon;
            const isExpanded = !!expandedUnits[unit.id];

            // Filter actual lesson elements that are mapped into this unit
            const unitLessons = allLessons.filter(lesson => unit.lessonIds.includes(lesson.id));

            // Calculate progress stats for this specific unit
            const unitTotal = unitLessons.length;
            let unitAttempted = 0;
            let unitMastered = 0;

            unitLessons.forEach(l => {
              const isAttempted = attemptedLessonsList.includes(l.id);
              if (isAttempted) {
                unitAttempted++;
                const lessonScores = scorecard.scores[l.id] || {};
                const hasErrors = Object.values(lessonScores).some(modes => 
                  Object.values(modes).some(v => v > 0)
                );
                if (!hasErrors) {
                  unitMastered++;
                }
              }
            });

            const percentMastered = unitTotal > 0 ? Math.round((unitMastered / unitTotal) * 100) : 0;

            return (
              <div 
                key={unit.id}
                className="bg-[#121212]/80 rounded-2xl border border-white/5 hover:border-white/10 overflow-hidden transition-all"
                id={`unit-container-${unit.id}`}
              >
                {/* Accordion Trigger Header */}
                <div 
                  onClick={() => toggleUnit(unit.id)}
                  className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-white/[0.02] transition-colors gap-4 select-none"
                  id={`unit-trigger-header-${unit.id}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Glowing Left Badge */}
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10 shrink-0">
                      <UnitIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold font-mono">
                          Unit {unit.id}
                        </span>
                        <span className="text-gray-500 text-[10px]">•</span>
                        <span className="text-gray-400 text-[10px] font-mono font-medium">
                          {unitTotal} Lessons
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-100 tracking-tight leading-tight">
                        {unit.name}
                      </h3>
                      <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
                        {unit.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Indicators & Chevron */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0">
                    <div className="text-left md:text-right space-y-1.5 pr-2">
                      <div className="text-xs font-semibold text-gray-300">
                        {unitMastered === unitTotal ? (
                          <span className="text-emerald-400 flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Unit Mastered
                          </span>
                        ) : (
                          <span>{unitMastered} / {unitTotal} Mastered</span>
                        )}
                      </div>
                      <div className="w-28 bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentMastered}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 p-2 rounded-xl text-gray-400 group-hover:text-white">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-Lessons Grid (Visible when open) */}
                {isExpanded && (
                  <div 
                    className="p-5 md:p-6 bg-black/40 border-t border-white/5 animate-fade-in"
                    id={`unit-lessons-drawer-${unit.id}`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {unitLessons.map(lesson => renderLessonCard(lesson))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // CLASSIC FULL GRID (with filters and search)
        <div>
          {/* Active Search & Filter Title Helper */}
          {(isSearchActive || isCategoryFilterActive) && (
            <div className="text-xs text-gray-500 mb-4 font-mono uppercase tracking-widest" id="search-filter-feedback">
              Showing {filteredLessons.length} matching modules of 22:
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" id="lessons-grid">
            {filteredLessons.map(lesson => renderLessonCard(lesson))}

            {filteredLessons.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-500" id="no-filtered-lessons">
                <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-sm">No courses matching your search filter were found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
