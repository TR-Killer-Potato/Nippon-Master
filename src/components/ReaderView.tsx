import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff, GraduationCap, Play } from "lucide-react";
import { ExpandedLesson } from "../data/lessons";
import { getStoryForLesson } from "../data/stories";
import Tooltip from "./Tooltip";

interface ReaderViewProps {
  lesson: ExpandedLesson;
  onBack: () => void;
  onStartQuiz: () => void;
}

export default function ReaderView({ lesson, onBack, onStartQuiz }: ReaderViewProps) {
  const [showEnglish, setShowEnglish] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState({ reading: "", meaning: "", x: 0, y: 0, isVisible: false });

  const story = getStoryForLesson(lesson.id);

  const handleVocabClick = (e: React.MouseEvent, vocab: { reading: string; meaning: string }) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      reading: vocab.reading,
      meaning: vocab.meaning,
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY,
      isVisible: true,
    });
  };

  const highlightText = (text: string, highlights: { word: string; reading: string; meaning: string }[]) => {
    const sortedHighlights = [...highlights].sort((a, b) => b.word.length - a.word.length);
    let parts: any[] = [{ text, isHighlight: false }];
    
    sortedHighlights.forEach(h => {
      let newParts: any[] = [];
      parts.forEach(part => {
        if (part.isHighlight) {
          newParts.push(part);
        } else {
          const split = part.text.split(h.word);
          for (let i = 0; i < split.length; i++) {
            newParts.push({ text: split[i], isHighlight: false });
            if (i < split.length - 1) {
              newParts.push({ text: h.word, isHighlight: true, vocab: h });
            }
          }
        }
      });
      parts = newParts;
    });
    
    return parts.map((part, i) => 
      part.isHighlight ? (
        <span key={i} className="cursor-pointer text-amber-500 font-bold hover:bg-amber-500/10 px-0.5 rounded transition-colors" onClick={(e) => handleVocabClick(e, part.vocab)}>{part.text}</span>
      ) : part.text
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto relative" id="reader-view-root">
      <Tooltip {...tooltip} onClose={() => setTooltip(prev => ({ ...prev, isVisible: false }))} />
      
      {/* Top action header */}
      <div className="flex items-center justify-between" id="reader-navigation">
        <button
          type="button"
          id="btn-reader-back"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          Dashboard
        </button>

        <button
          type="button"
          id="btn-reader-start-quiz"
          onClick={onStartQuiz}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer hover:text-black"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Take Quiz
        </button>
      </div>

      {/* Book/Gutenberg Layout */}
      <div className="bg-[#0d0d0d] rounded-3xl border border-white/10 p-6 md:p-10 space-y-8 shadow-2xl" id="story-reader-paper">
        <div className="space-y-4 text-center pb-6 border-b border-white/5" id="story-reader-meta">
          <span className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">
            {lesson.id} Reading
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-100 tracking-tight font-sans">
            {story.title}
          </h2>
          
          {/* Reader controls */}
          <div className="flex items-center justify-center gap-2 pt-2" id="reader-toolbar">
            <button
              type="button"
              id="btn-toggle-translation"
              onClick={() => setShowEnglish(!showEnglish)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                showEnglish 
                  ? "bg-amber-500 text-black border-amber-600 font-bold" 
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {showEnglish ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showEnglish ? "Hide English" : "Show English"}
            </button>
          </div>
        </div>

        {/* Story text blocks */}
        <div className="space-y-6" id="story-content-box">
          <div className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/5" id="japanese-text-container">
            <p className="text-gray-100 text-lg md:text-xl leading-loose tracking-wide font-sans select-text whitespace-pre-wrap">
              {highlightText(story.japanese, story.vocabularyHighlights)}
            </p>
          </div>

          {/* English translation panel */}
          {showEnglish && (
            <div className="p-6 md:p-8 bg-[#121212] rounded-2xl border-l-[3px] border-amber-500/40 transition-all text-gray-300 text-sm md:text-base leading-relaxed animate-fade-in" id="english-text-container">
              <h4 className="font-bold text-amber-500 text-xs tracking-wider uppercase mb-2 font-mono">English Review</h4>
              <p>{story.english}</p>
            </div>
          )}
        </div>
      </div>

      {/* Vocabulary Glossary breakdown */}
      <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 p-6 md:p-8 space-y-4 shadow-xl" id="vocabulary-glossary-box">
        <div id="glossary-header">
          <h3 className="font-bold text-gray-100 text-sm flex items-center gap-2">
            <GraduationCap className="text-amber-500 w-5 h-5" />
            Spotlight Vocabulary ({story.vocabularyHighlights.length})
          </h3>
          <p className="text-xs text-gray-500 mt-1">Select any item to match translations or prepare for the vocab test.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2" id="glossary-grid">
          {story.vocabularyHighlights.map((hl) => (
            <div
              key={hl.word}
              id={`vocab-spot-${hl.word}`}
              onClick={() => setSelectedWord(selectedWord === hl.word ? null : hl.word)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedWord === hl.word 
                  ? "bg-amber-500/10 border-amber-500/40 shadow-sm" 
                  : "bg-white/5 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-200 text-base font-sans">{hl.word}</h4>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{hl.reading}</p>
                </div>
                {selectedWord === hl.word ? (
                  <span className="text-[10px] bg-amber-500 text-black font-extrabold px-2.5 py-0.5 rounded-full font-sans">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] bg-white/5 text-gray-500 border border-white/5 px-2.5 py-0.5 rounded-full font-mono">
                    Detail
                  </span>
                )}
              </div>
              
              <div className={`mt-3 pt-2.5 border-t border-white/5 text-xs text-gray-300 leading-normal transition-all duration-300 ${
                selectedWord === hl.word ? "block" : "hidden"
              }`}>
                <p><strong className="font-bold text-gray-100">Meaning:</strong> {hl.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
