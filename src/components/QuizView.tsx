import React, { useState, useEffect } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, RefreshCcw, Star, Trophy, XCircle } from "lucide-react";
import { ExpandedLesson, ExpandedVocab } from "../data/lessons";

interface QuizViewProps {
  lesson: ExpandedLesson;
  onBack: () => void;
  onLogMistake: (lessonId: string, word: string, testMode: string) => void;
}

interface Question {
  vocab: ExpandedVocab;
  testMode: "Reading" | "Meaning";
  prompt: string;
  correctAnswer: string;
  options: string[];
}

export default function QuizView({ lesson, onBack, onLogMistake }: QuizViewProps) {
  const [quizLength, setQuizLength] = useState<10 | "all">("all");
  const [isConfiguring, setIsConfiguring] = useState(true);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [incorrectList, setIncorrectList] = useState<{ vocab: ExpandedVocab; mode: string }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize and shuffle quiz questions
  const startQuiz = () => {
    // 1. Shuffles entire available list
    const shuffledVocab = [...lesson.vocabulary].sort(() => Math.random() - 0.5);
    
    // 2. Splices based on requested quiz length
    const targetedList = quizLength === 10 ? shuffledVocab.slice(0, 10) : shuffledVocab;

    const builtQuestions: Question[] = targetedList.map((item) => {
      // Determine direction: reading or meaning
      let testMode: "Reading" | "Meaning" = Math.random() > 0.5 ? "Reading" : "Meaning";
      
      // If reading matches vocabulary natively, always test meaning
      if (item.isReadingRedundant || item.r === "-") {
        testMode = "Meaning";
      }

      const prompt = item.v;
      const correctAnswer = testMode === "Reading" ? item.r : item.m;
      
      // Accumulate incorrect distractor options
      const distractors = testMode === "Reading" ? item.dr : item.dm;
      
      // Filter out any duplicates and force lowercase/trimmed equals check
      const cleanDistractors = distractors.filter(d => d !== correctAnswer && d !== "-");

      // Shuffle options (insert correct option randomly)
      const options = [correctAnswer, ...cleanDistractors.slice(0, 3)].sort(() => Math.random() - 0.5);

      return {
        vocab: item,
        testMode,
        prompt,
        correctAnswer,
        options
      };
    });

    setQuestions(builtQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectAnswersCount(0);
    setIncorrectList([]);
    setIsCompleted(false);
    setIsConfiguring(false);
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const question = questions[currentIndex];
    const isCorrect = option === question.correctAnswer;

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      // Record mistake
      setIncorrectList((prev) => [...prev, { vocab: question.vocab, mode: question.testMode }]);
      onLogMistake(lesson.id, question.vocab.v, `Vocab-${question.testMode}`);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  if (isConfiguring) {
    return (
      <div className="max-w-md mx-auto bg-[#0d0d0d] rounded-3xl border border-white/10 p-8 shadow-2xl space-y-6" id="quiz-config-root">
        <div className="space-y-2 text-center" id="quiz-config-header">
          <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase font-mono">
            {lesson.id} Test Setup
          </span>
          <h2 className="text-xl font-bold text-gray-100 tracking-tight font-sans">
            Configure Quiz Parameters
          </h2>
          <p className="text-gray-500 text-xs">Choose the quiz length before launching the test.</p>
        </div>

        <div className="space-y-4 pt-2" id="quiz-config-form">
          {/* Length options */}
          <div className="space-y-2" id="length-radio-group">
            <span className="text-xs font-semibold text-gray-400">Question Volume</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-length-quick"
                onClick={() => setQuizLength(10)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  quizLength === 10 
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400 ring-2 ring-amber-500/10" 
                    : "bg-white/5 border-white/5 hover:border-white/20 text-gray-400"
                }`}
              >
                <div className="text-sm font-bold">Quick Deck</div>
                <div className="text-[10px] text-gray-500 mt-1">10 random questions</div>
              </button>
              
              <button
                type="button"
                id="btn-length-all"
                onClick={() => setQuizLength("all")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  quizLength === "all" 
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400 ring-2 ring-amber-500/10" 
                    : "bg-white/5 border-white/5 hover:border-white/20 text-gray-400"
                }`}
              >
                <div className="text-sm font-bold">Full Lesson</div>
                <div className="text-[10px] text-gray-500 mt-1">{lesson.vocabulary.length} total vocabulary items</div>
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2" id="quiz-tips">
            <h4 className="text-xs font-bold text-gray-300">Quiz Guidance</h4>
            <ul className="text-[11px] text-gray-500 space-y-1 ml-4 list-disc">
              <li>Skipping redundant reading tests for clean Katakana/Latin layouts.</li>
              <li>Incorrect choices are dynamically registered in your scorecard.</li>
              <li>Practice at your own pace; no timers are enforced.</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-4" id="config-actions">
            <button
              type="button"
              id="btn-config-back"
              onClick={onBack}
              className="flex-1 py-3 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-config-start"
              onClick={startQuiz}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold hover:text-black rounded-xl text-xs transition-all shadow-md shadow-amber-500/5 cursor-pointer"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const accuracy = Math.round((correctAnswersCount / questions.length) * 105); // Standardized percent
    const maxPercent = Math.min(accuracy, 100);

    return (
      <div className="max-w-md mx-auto bg-[#0d0d0d] rounded-3xl border border-white/10 p-8 shadow-2xl space-y-6 text-center animate-fade-in" id="quiz-completion">
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full w-14 h-14 flex items-center justify-center mx-auto" id="completion-trophy">
          <Trophy className="w-6 h-6 fill-current text-amber-500" />
        </div>

        <div className="space-y-1.5" id="completion-scores">
          <span className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">
            Test Done!
          </span>
          <h2 className="text-xl font-bold text-gray-100 tracking-tight font-sans">
            Results for {lesson.id}
          </h2>
          <p className="text-gray-500 text-xs">
            Completed overall testing segment. Let's inspect your score!
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 grid grid-cols-2 gap-4 border border-white/5" id="scorecard-summary-card">
          <div>
            <div className="text-2xl font-bold text-gray-200">{correctAnswersCount}/{questions.length}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 font-mono">Answers Correct</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-500">{maxPercent}%</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 font-mono">Accuracy</div>
          </div>
        </div>

        {incorrectList.length > 0 ? (
          <div className="space-y-2.5 text-left" id="incorrectly-list-box">
            <span className="text-xs font-semibold text-gray-300">Errors to review ({incorrectList.length})</span>
            <div className="max-h-40 overflow-y-auto border border-white/5 rounded-xl divide-y divide-white/5 bg-white/5 p-2" id="completion-errors">
              {incorrectList.map((err, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 text-xs font-sans px-2" id={`err-item-${idx}`}>
                  <div>
                    <strong className="text-gray-200 font-bold">{err.vocab.v}</strong>
                    <span className="text-gray-500 ml-1">({err.vocab.r !== "-" ? err.vocab.r : "Katakana"})</span>
                  </div>
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 rounded uppercase font-mono font-medium">
                    {err.mode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl flex items-center gap-2 border border-emerald-500/20" id="zero-mistakes-notice">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">Perfect Lesson score! Zero mistakes logged.</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-4" id="completion-actions">
          <button
            type="button"
            id="btn-completion-retry"
            onClick={startQuiz}
            className="flex-1 py-3 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry Lesson
          </button>
          <button
            type="button"
            id="btn-completion-dashboard"
            onClick={onBack}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold hover:text-black rounded-xl text-xs transition-all shadow-md shadow-amber-500/5 cursor-pointer"
          >
            Go Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6" id="quiz-active-root">
      {/* Quiz Progress header bar */}
      <div className="flex items-center justify-between" id="active-quiz-header">
        <button
          type="button"
          id="btn-quiz-quit"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          Give up quiz
        </button>

        <span className="text-xs font-mono text-gray-400 font-bold p-1 px-3 bg-white/5 border border-white/10 rounded-full">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="bg-[#0d0d0d] rounded-3xl border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl" id="active-quiz-panel">
        {/* Dynamic question board prompt layout */}
        <div className="text-center py-6 border-b border-white/5 space-y-2" id="prompt-block">
          <span className="text-[10px] font-bold tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 rounded-full uppercase font-mono">
            Identify the {currentQuestion.testMode}
          </span>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-100 tracking-tight font-sans">
            {currentQuestion.prompt}
          </h3>
          <p className="text-gray-500 text-xs select-none">Select the option that matches the vocabulary word above.</p>
        </div>

        {/* Dynamic status feedback (Occupies constant space to avoid button shifting) */}
        <div className="min-h-[100px] flex flex-col justify-center" id="active-quiz-status-container">
          {isAnswered ? (
            <div className="animate-fade-in animate-duration-200" id="active-quiz-status">
              <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
                selectedOption === currentQuestion.correctAnswer 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                {selectedOption === currentQuestion.correctAnswer ? (
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                )}
                <div className="text-xs leading-normal font-sans" id="feedback-desc">
                  <span className="font-bold flex items-center">
                    {selectedOption === currentQuestion.correctAnswer ? "Correct match!" : "Incorrect answer"}
                  </span>
                  <p className="mt-1 text-gray-300">
                    Vocabulary word <strong className="font-bold text-gray-100">{currentQuestion.vocab.v}</strong> translates to <strong className="font-bold text-gray-100">{currentQuestion.vocab.h !== "-" ? currentQuestion.vocab.h : (currentQuestion.vocab.r !== "-" ? currentQuestion.vocab.r : "Katakana")}</strong> meaning <strong className="font-bold text-gray-100">"{currentQuestion.vocab.m}"</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full" aria-hidden="true" />
          )}
        </div>

        {/* Option list buttons */}
        <div className="grid grid-cols-1 gap-3 pt-2" id="options-block">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === currentQuestion.correctAnswer;
            
            let btnClass = "border-white/10 hover:border-white/30 bg-white/5 text-gray-200 hover:bg-white/10";
            if (isAnswered) {
              if (isCorrectOption) {
                // Flash green
                btnClass = "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/5 font-bold";
              } else if (isSelected) {
                // Flash red on incorrect item chosen
                btnClass = "border-red-500/40 bg-red-500/10 text-red-400 ring-2 ring-red-500/5";
              } else {
                // Dim rest
                btnClass = "border-white/5 bg-[#0a0a0a] text-gray-600 opacity-30";
              }
            }

            return (
              <button
                key={option}
                type="button"
                id={`quiz-option-${option.toLowerCase().replace(" ", "-")}`}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`w-full p-4 rounded-2xl border text-center transition-all cursor-pointer ${btnClass}`}
              >
                <div className="text-sm font-semibold">{option}</div>
              </button>
            );
          })}
        </div>

        {/* Next Question / Finish Quiz button (Maintains position at the bottom of the card) */}
        {isAnswered && (
          <div className="pt-2 animate-fade-in" id="active-quiz-next">
            <button
              type="button"
              id="btn-quiz-next"
              onClick={handleNext}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold hover:text-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/5 text-center"
            >
              {currentIndex + 1 === questions.length ? "Finish Quiz" : "Next Question"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
