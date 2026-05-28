import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, HelpCircle, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StructureNode {
  glyph?: string;
  name?: string;
  strokeIndices?: number[];
  operator?: string;
  children?: StructureNode[];
}

interface ComponentObj {
  kanji: string;
  radical: string;
  rad_name: string;
  meaning: string;
  structure: {
    operator: string;
    children: StructureNode[];
  };
  strokes: string[];
}

interface VocabRecord {
  id: string;
  vocabulary: string;
  reading: string;
  meaning: string;
  components: (ComponentObj | "-")[] | "-";
  phonetic_anchors: string[];
  context_sentence: {
    sentence_ja: string;
    sentence_en: string;
  };
}

interface FlashcardDeckProps {
  onBack: () => void;
}

const FALLBACK_VOCAB_DATA: Record<string, Omit<VocabRecord, "id">> = {
  "N5-22-17": {
    "vocabulary": "速く",
    "reading": "はやく",
    "meaning": "Early/fast",
    "components": [
      {
        "kanji": "速",
        "radical": "⻌",
        "rad_name": "road",
        "meaning": "fast / quick",
        "structure": {
          "operator": "⿺",
          "children": [
            { "glyph": "辶", "name": "road", "strokeIndices": [7, 8, 9, 10] },
            { "glyph": "束", "name": "bundle", "strokeIndices": [0, 1, 2, 3, 4, 5, 6] }
          ]
        },
        "strokes": [
          "M 35,22 L 65,22",
          "M 50,14 L 50,45",
          "M 32,32 L 68,32",
          "M 35,32 L 35,45",
          "M 65,32 L 65,45",
          "M 38,45 L 62,45",
          "M 50,45 L 50,55",
          "M 20,62 Q 22,50 30,55",
          "M 15,75 Q 22,65 35,74",
          "M 10,90 Q 25,75 55,80",
          "M 8,94 L 88,94"
        ]
      },
      "-"
    ],
    "phonetic_anchors": ["Hammer", "Yacht", "Cushion"],
    "context_sentence": {
      "sentence_ja": "朝<b>速く</b>起きて、散歩をしました。",
      "sentence_en": "I woke up early in the morning and took a walk."
    }
  },
  "N5-1-1": {
    "vocabulary": "私",
    "reading": "わたし",
    "meaning": "I / Me",
    "components": [
      {
        "kanji": "私",
        "radical": "禾",
        "rad_name": "grain",
        "meaning": "myself / private",
        "structure": {
          "operator": "⿰",
          "children": [
            { "glyph": "禾", "name": "grain", "strokeIndices": [0, 1, 2, 3, 4] },
            { "glyph": "ム", "name": "private", "strokeIndices": [5, 6] }
          ]
        },
        "strokes": [
          "M 40,20 Q 30,28 15,35",
          "M 15,36 L 45,36",
          "M 30,36 L 30,85",
          "M 30,52 L 15,68",
          "M 30,52 L 44,70",
          "M 70,25 Q 70,45 54,60",
          "M 54,60 L 80,60"
        ]
      }
    ],
    "phonetic_anchors": ["Water", "Tower", "Shield"],
    "context_sentence": {
      "sentence_ja": "<b>私</b>は毎日日本語を勉強します。",
      "sentence_en": "I study Japanese every day."
    }
  },
  "N5-1-2": {
    "vocabulary": "あなた",
    "reading": "-",
    "meaning": "You",
    "components": "-",
    "phonetic_anchors": [],
    "context_sentence": {
      "sentence_ja": "<b>あなた</b>の趣味は何ですか。",
      "sentence_en": "What is your hobby?"
    }
  },
  "N5-1-3": {
    "vocabulary": "学生",
    "reading": "がくせい",
    "meaning": "Student",
    "components": [
      {
        "kanji": "学",
        "radical": "子",
        "rad_name": "child",
        "meaning": "study / learn",
        "structure": {
          "operator": "⿱",
          "children": [
            { "glyph": "ツ", "name": "crown/points", "strokeIndices": [0, 1, 2] },
            { "glyph": "子", "name": "child/radical", "strokeIndices": [3, 4, 5] }
          ]
        },
        "strokes": [
          "M 30,20 L 32,32",
          "M 48,18 L 50,30",
          "M 66,15 L 58,27",
          "M 25,44 Q 50,38 75,44",
          "M 50,44 L 50,75",
          "M 28,60 L 72,60"
        ]
      },
      {
        "kanji": "生",
        "radical": "生",
        "rad_name": "life",
        "meaning": "life / birth",
        "structure": {
          "operator": "⿳",
          "children": [
            { "glyph": "𠂉", "name": "diagonal", "strokeIndices": [0, 1] },
            { "glyph": "土", "name": "earth", "strokeIndices": [2, 3, 4] }
          ]
        },
        "strokes": [
          "M 55,15 Q 40,24 25,36",
          "M 25,37 L 75,37",
          "M 50,37 L 50,82",
          "M 30,58 L 70,58",
          "M 15,82 L 85,82"
        ]
      }
    ],
    "phonetic_anchors": ["Glass", "Sword", "Sail"],
    "context_sentence": {
      "sentence_ja": "彼は東京大学の<b>学生</b>です。",
      "sentence_en": "He is a student of the University of Tokyo."
    }
  }
};

export default function FlashcardDeck({ onBack }: FlashcardDeckProps) {
  const [vocabList, setVocabList] = useState<VocabRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Drilldown states inside the back of card
  const [selectedKanjiIndex, setSelectedKanjiIndex] = useState(0);
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);

  // Dynamic schema loading with failover fallback
  useEffect(() => {
    let active = true;
    async function loadSchema() {
      try {
        const response = await fetch("/vocabulary_elements.txt");
        if (!response.ok) {
          throw new Error(`File loading status error: ${response.status}`);
        }
        const data = await response.json();
        const records = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val,
        }));
        if (active) {
          setVocabList(records);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Using premium fallback mock schema due to fetch issue:", err);
        const records = Object.entries(FALLBACK_VOCAB_DATA).map(([id, val]: [string, any]) => ({
          id,
          ...val,
        }));
        if (active) {
          setVocabList(records);
          setLoading(false);
        }
      }
    }
    loadSchema();
    return () => {
      active = false;
    };
  }, []);

  // Automatically reset card flip state and selected kanji drilldown whenever index shifts
  useEffect(() => {
    setIsFlipped(false);
    setSelectedKanjiIndex(0);
    setActiveComponentId(null);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < vocabList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4" id="flashcard-loader">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-xs font-mono tracking-wider">LOADING VOCABULARY DECK...</span>
      </div>
    );
  }

  const activeRecord = vocabList[currentIndex];
  if (!activeRecord) {
    return (
      <div className="text-center py-20 text-gray-500" id="flashcard-empty">
        <p className="text-sm">Empty deck state found.</p>
        <button onClick={onBack} className="mt-4 text-xs font-bold text-amber-500 underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isPurePhonetic = activeRecord.components === "-";

  // Identify selected kanji block dynamically
  const isComponentsArray = Array.isArray(activeRecord.components);
  const availableKanjiList = isComponentsArray 
    ? (activeRecord.components as (ComponentObj | "-")[]).filter((c): c is ComponentObj => c !== "-")
    : [];

  // Guarantee we do not overflow selected kanji
  const activeKanji = availableKanjiList[selectedKanjiIndex] || null;

  // Track active stroke indexes on selection change
  const activeStrokeIndices: number[] = (() => {
    if (!activeComponentId || !activeKanji) return [];
    
    const findStrokesInTree = (node: StructureNode): number[] => {
      if (!node) return [];
      const id = `${node.glyph}_${node.name}`;
      if (id === activeComponentId) {
        return node.strokeIndices || [];
      }
      if (node.children) {
        for (const child of node.children) {
          const matched = findStrokesInTree(child);
          if (matched.length > 0) return matched;
        }
      }
      return [];
    };

    return findStrokesInTree(activeKanji.structure);
  })();

  // Recursive Decomposition Tree Renderer
  const renderDecompositionNode = (node: StructureNode) => {
    if (!node) return null;

    if (node.operator && node.children) {
      return (
        <div className="flex flex-col items-stretch border border-dashed border-gray-300 dark:border-white/10 p-2.5 rounded-lg bg-black/5 dark:bg-white/[0.02] space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between w-full">
            <span className="text-[9px] uppercase tracking-widest font-mono select-none px-1 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded border border-amber-500/10">
              Joint Operator: <span className="font-bold">{node.operator}</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {node.children.map((child, index) => (
              <div key={index} className="w-full">
                {renderDecompositionNode(child)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    const uniqueId = `${node.glyph}_${node.name}`;
    const isSelected = activeComponentId === uniqueId;

    return (
      <button
        type="button"
        id={`decomp-node-${node.glyph}`}
        onClick={(e) => {
          e.stopPropagation();
          setActiveComponentId(prev => prev === uniqueId ? null : uniqueId);
        }}
        className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
          isSelected
            ? "bg-amber-500/15 border-amber-500 dark:border-amber-500 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/20 shadow-md"
            : "bg-white border-gray-200 dark:bg-white/5 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 text-gray-800 dark:text-gray-300"
        }`}
      >
        <div className="flex items-center justify-between pointer-events-none">
          <span className="text-xl font-bold font-sans">{node.glyph}</span>
          <span className="text-[8px] bg-gray-100 dark:bg-white/5 px-1 py-0.5 rounded font-mono text-gray-400 dark:text-gray-500">
            RADICAL
          </span>
        </div>
        <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1 pointer-events-none">
          {node.name}
        </div>
        <div className="text-[8px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 pointer-events-none">
          Strokes: {node.strokeIndices ? node.strokeIndices.join(", ") : "-"}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4" id="flashcard-deck-layout">
      
      {/* Top dashboard navigation rail */}
      <div className="flex items-center justify-between" id="deck-header-rail">
        <button
          type="button"
          id="btn-deck-back"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>Exit Study Deck</span>
        </button>

        <div className="text-xs text-gray-500 font-mono font-semibold" id="deck-counter-badge">
          RECORD: <span className="text-amber-500 font-bold">{currentIndex + 1}</span> OF <span className="text-gray-300 font-bold">{vocabList.length}</span>
        </div>
      </div>

      {/* Main Flashcard view with physical canvas theme (cream/slate container to fulfill elegant neutral-100 specification) */}
      <div className="min-h-[460px] md:min-h-[500px] w-full flex flex-col justify-stretch select-none" id="flashcard-canvas-outer">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`flex-grow relative cursor-pointer group transition-all duration-500 rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col justify-between ${
            isFlipped 
              ? "bg-slate-50 dark:bg-[#121212] border-amber-500/20" 
              : "bg-neutral-100 dark:bg-[#0e0e0e] hover:border-amber-500/40"
          }`}
          id="interactive-flashcard-body"
        >
          {/* Card Status Indicator */}
          <div className="flex items-center justify-between w-full text-[10px] tracking-wider uppercase font-mono text-gray-400 dark:text-gray-500">
            <span>INDEX MODULE: {activeRecord.id}</span>
            <div className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
              <RefreshCw className="w-3 h-3 animate-pulse" />
              <span>{isFlipped ? "TAP TO HIDE RESOLUTION" : "TAP TO REVEAL KEY"}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isFlipped ? (
              /* [FRONT OF CARD] */
              <motion.div
                key="front-face"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-grow flex flex-col justify-between pt-8 pb-4"
                id="face-front-container"
              >
                {/* Center Main word String */}
                <div className="text-center my-auto">
                  <h2 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-800 dark:text-white font-sans leading-none select-text">
                    {activeRecord.vocabulary}
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 uppercase tracking-widest font-mono">
                    Visual Recognition Phase
                  </p>
                </div>

                {/* COMPONENT BLUEPRINT: Raw priming bar of parts near bottom */}
                <div className="text-center pt-6 border-t border-gray-300/40 dark:border-white/5" id="blueprint-priming-footer">
                  <div className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">
                    Component Blueprint Blueprint
                  </div>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {isComponentsArray ? (
                      (activeRecord.components as (ComponentObj | "-")[]).map((c, i) => {
                        if (c === "-") {
                          // Okurigana placeholder rendering
                          return (
                            <div 
                              key={i} 
                              className="px-2.5 py-1 bg-gray-200/50 dark:bg-white/5 border border-dashed border-gray-400 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-400 dark:text-gray-500"
                            >
                              {activeRecord.vocabulary[i] || "-"}
                            </div>
                          );
                        }
                        return (
                          <div 
                            key={i} 
                            className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold shadow-sm"
                          >
                            {c.kanji} <span className="opacity-60 text-[10px] font-normal">({c.meaning})</span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono italic">
                        No kanji components (Pure Phonetic Item)
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* [BACK OF CARD] IMPLEMENT RESOLUTION MATRIX */
              <motion.div
                key="back-face"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-grow flex flex-col justify-between pt-6 space-y-6"
                id="face-back-container"
              >
                {/* HEADERS ZONE */}
                {isPurePhonetic ? (
                  /* A. THE KANA SHORT-CIRCUIT RENDERING RULE HEADER */
                  <div className="text-center" id="kana-shortcut-header">
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white leading-snug">
                      {activeRecord.meaning}
                    </h3>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono tracking-widest uppercase mt-1">
                      PHONETIC SYLLABARY LESSON
                    </p>
                  </div>
                ) : (
                  /* B. THE KANJI / HYBRID LAYOUT HEADER */
                  <div className="flex flex-col items-center text-center gap-1" id="hybrid-kanji-header">
                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {activeRecord.meaning}
                    </h3>
                    <span className="text-sm font-semibold tracking-wide text-amber-600 dark:text-amber-400 px-3 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                      Reading: {activeRecord.reading}
                    </span>
                  </div>
                )}

                {/* CENTRAL FRAME WORKFLOW */}
                {isPurePhonetic ? (
                  /* KANA LAYOUT: Beautifully padded, full-width immersion canvas */
                  <div 
                    className="flex-grow flex flex-col justify-center items-center py-6 bg-amber-500/[0.02] border border-dashed border-gray-300 dark:border-white/5 rounded-2xl" 
                    id="pure-kana-immersion-canvas"
                  >
                    <span className="text-7xl md:text-8xl font-black text-amber-500 tracking-normal font-sans shadow-text">
                      {activeRecord.vocabulary}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-widest uppercase mt-4">
                      Direct reading phonetic anchor
                    </span>
                  </div>
                ) : (
                  /* KANJI INTERACTIVE GRID LAYOUT */
                  <div className="space-y-4" id="kanji-interactive-grid-interface">
                    
                    {/* Okurigana Spacer Enforcement: Dynamic multi-kanji selector row */}
                    {isComponentsArray && (activeRecord.components as any[]).length > 1 && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-2 border-b border-gray-200 dark:border-white/5 pb-3.5"
                        id="okurigana-selector-bar"
                      >
                        {(activeRecord.components as (ComponentObj | "-")[]).map((comp, idx) => {
                          if (comp === "-") {
                            // Okurigana spacer is rendered as a clean, neutral placeholder box
                            return (
                              <div
                                key={idx}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-200/50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 text-gray-400 dark:text-gray-500 select-none font-sans text-xl"
                                title="Okurigana grammar offset spacer"
                              >
                                {activeRecord.vocabulary[idx] || "-"}
                              </div>
                            );
                          }

                          const isSelected = selectedKanjiIndex === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedKanjiIndex(idx);
                                setActiveComponentId(null);
                              }}
                              className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl font-bold font-sans text-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-amber-500 text-black border-amber-500 font-black shadow-lg shadow-amber-500/10 scale-105"
                                  : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/20"
                              }`}
                            >
                              <span>{comp.kanji}</span>
                              <span className={`text-[7px] font-mono leading-none ${isSelected ? "text-black/60" : "text-gray-500"}`}>
                                KANJI
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Left/Right Split Grid */}
                    {activeKanji && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch"
                        id="kanji-split-canvas"
                      >
                        {/* LEFT CELL (The Decomposition Tree) */}
                        <div className="flex flex-col justify-between space-y-3" id="tree-decomposition-box">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                              Structure Matrix (<span className="text-amber-500 font-bold">{activeKanji.kanji}</span>)
                            </span>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Tap structural radicals to illuminate their stroke coordinates on the right canvas.
                            </p>
                          </div>
                          
                          <div className="flex-grow flex flex-col justify-center space-y-2">
                            {renderDecompositionNode(activeKanji.structure)}
                          </div>

                          <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10">
                            Semantic Meaning: <strong className="font-bold text-slate-800 dark:text-gray-200">{activeKanji.meaning}</strong>
                          </div>
                        </div>

                        {/* RIGHT CELL (The Stroke Canvas) */}
                        <div className="flex flex-col justify-between space-y-3" id="stroke-canvas-box">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                              Vector Stroke Canvas
                            </span>
                            {activeComponentId && (
                              <button
                                type="button"
                                onClick={() => setActiveComponentId(null)}
                                className="text-[9px] font-mono bg-amber-550 hover:bg-amber-600 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/10"
                              >
                                Clear Highlight
                              </button>
                            )}
                          </div>
                          
                          {/* Svg area with backdrop tap release to clear selected element */}
                          <div 
                            onClick={() => setActiveComponentId(null)}
                            className="bg-gray-100 dark:bg-black/20 rounded-2xl p-4 flex items-center justify-center border border-gray-200 dark:border-white/10 aspect-square max-h-64 md:max-h-none sm:aspect-auto"
                          >
                            <svg
                              viewBox="0 0 100 100"
                              className="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60"
                              id="stroke-svg-canvas"
                            >
                              {/* Standard Kanji Background Grid lines */}
                              <line x1="50" y1="0" x2="50" y2="100" stroke="#9ca3af" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
                              <line x1="0" y1="50" x2="100" y2="50" stroke="#9ca3af" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
                              
                              {/* Coordinate path rendering */}
                              {activeKanji.strokes.map((pathDef, idx) => {
                                const isHighlighted = activeStrokeIndices.includes(idx);
                                return (
                                  <path
                                    key={idx}
                                    d={pathDef}
                                    fill="none"
                                    stroke={isHighlighted ? "#f59e0b" : "#9ca3af"}
                                    strokeWidth={isHighlighted ? "5.5" : "3.5"}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="transition-all duration-300"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                          <div className="text-[9px] text-gray-400 dark:text-gray-500 font-mono text-center">
                            Total Strokes mapped: {activeKanji.strokes.length} paths
                          </div>
                        </div>
                      </div>
                    )}

                    {/* THE PHONETIC ANCHOR FOOTER RAIL */}
                    {activeRecord.phonetic_anchors && activeRecord.phonetic_anchors.length > 0 && (
                      <div className="pt-2 border-t border-gray-200 dark:border-white/5" id="phonetic-anchor-rail">
                        <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">
                          Phonetic Mnemonic Syllable Trail:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {activeRecord.phonetic_anchors.map((anchor, anchorIdx) => (
                            <span 
                              key={anchorIdx}
                              className="text-[10px] font-semibold px-2.5 py-0.5 bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-white/10 rounded-full"
                            >
                              {anchor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* C. CONTEXT SENTENCE FOOTER BLOCK (ALWAYS VISIBLE) */}
                <div 
                  className="pt-4 border-t border-gray-300/40 dark:border-white/5 space-y-1 bg-black/5 dark:bg-white/[0.01] p-3 rounded-xl border border-gray-200 dark:border-white/10 text-left" 
                  id="context-sentence-footer"
                >
                  <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                    Syntactic Context Block:
                  </span>
                  <p 
                    className="text-base text-slate-800 dark:text-gray-100 font-medium font-sans"
                    dangerouslySetInnerHTML={{ __html: activeRecord.context_sentence.sentence_ja }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {activeRecord.context_sentence.sentence_en}
                  </p>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Control navigation deck below card track */}
      <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-2xl border border-white/5 shadow-inner" id="deck-control-rail">
        <button
          type="button"
          id="btn-deck-prev"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex-1 max-w-[130px] py-2 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          id="btn-deck-flip-trigger"
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10 uppercase tracking-wide"
        >
          Flip Card
        </button>

        <button
          type="button"
          id="btn-deck-next"
          onClick={handleNext}
          disabled={currentIndex === vocabList.length - 1}
          className="flex-1 max-w-[130px] py-2 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-gray-300 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
        </button>
      </div>

    </div>
  );
}
