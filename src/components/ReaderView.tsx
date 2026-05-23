import React, { useState } from "react";
import { ArrowLeft, BookOpen, Eye, EyeOff, GraduationCap, Play, RefreshCw, Star } from "lucide-react";
import { ExpandedLesson } from "../data/lessons";
import { getStoryForLesson } from "../data/stories";

interface ReaderViewProps {
  lesson: ExpandedLesson;
  onBack: () => void;
  onStartQuiz: () => void;
}

export default function ReaderView({ lesson, onBack, onStartQuiz }: ReaderViewProps) {
  const [showEnglish, setShowEnglish] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const story = getStoryForLesson(lesson.id);

  // Helper to split Japanese text into interactive highlighted segments
  const renderInteractiveText = () => {
    let result = story.japanese;
    story.vocabularyHighlights.forEach((highlight) => {
      // Safely replace words with markup representation to parse or map directly
    });

    // Instead of complex innerHTML replace, we can parse simple tokens or just emphasize
    // their click actions in the vocabulary drawer below.
    return (
      <p className="text-stone-800 text-lg md:text-xl leading-loose tracking-wide font-sans select-text">
        {story.japanese}
      </p>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto" id="reader-view-root">
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
              id="btn-toggle-furigana"
              onClick={() => setShowFurigana(!showFurigana)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                showFurigana 
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {showFurigana ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {showFurigana ? "Furigana ON" : "Furigana OFF"}
            </button>
            
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
          {/* Japanese text pane with ruby tags if furigana is enabled */}
          <div className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/5" id="japanese-text-container">
            {showFurigana ? (
              <p className="text-gray-100 text-lg md:text-xl leading-loose tracking-wide font-sans select-text whitespace-normal">
                {/* Dynamically replace highlighted words with ruby elements */}
                {/* For Lesson 1-4, display robust pre-designed ruby layouts, or fallback */}
                {lesson.id === "Lesson 1" ? (
                  <>
                    私 <ruby>は <rt className="text-amber-500/60 font-mono text-[10px]">wa</rt></ruby> <ruby>学生 <rt className="text-amber-500/60 font-mono text-[10px]">がくせい</rt></ruby>です。<ruby>本 <rt className="text-amber-500/60 font-mono text-[10px]">ほん</rt></ruby>を読みます。私の<ruby>家 <rt className="text-amber-500/60 font-mono text-[10px]">いえ</rt></ruby>には可愛い<ruby>猫 <rt className="text-amber-500/60 font-mono text-[10px]">ねこ</rt></ruby>がいます。猫の名前は「たま」です。私 <ruby>は <rt className="text-amber-500/60 font-mono text-[10px]">wa</rt></ruby> <ruby>海 <rt className="text-amber-500/60 font-mono text-[10px]">うみ</rt></ruby>と<ruby>映画 <rt className="text-amber-500/60 font-mono text-[10px]">えいが</rt></ruby>が大好きです。<ruby>明日 <rt className="text-amber-500/60 font-mono text-[10px]">あした</rt></ruby>は<ruby>月曜日 <rt className="text-amber-500/60 font-mono text-[10px]">げつようび</rt></ruby>です。月曜日は忙しいですが、<ruby>友達 <rt className="text-amber-500/60 font-mono text-[10px]">ともだち</rt></ruby>に会うので大丈夫です。冷たい<ruby>水 <rt className="text-amber-500/60 font-mono text-[10px]">みず</rt></ruby>を飲んで、元気に勉強を頑張ります。
                  </>
                ) : lesson.id === "Lesson 2" ? (
                  <>
                    <ruby>昨日 <rt className="text-amber-500/60 font-mono text-[10px]">きのう</rt></ruby>、私は<ruby>駅 <rt className="text-amber-500/60 font-mono text-[10px]">えき</rt></ruby>の近くの<ruby>ホテル <rt className="text-amber-500/60 font-mono text-[10px]">ほてる</rt></ruby>に行きました。駅には新しいコンビニとカフェがあります。私はカフェで<ruby>パン <rt className="text-amber-500/60 font-mono text-[10px]">ぱん</rt></ruby>と<ruby>牛乳 <rt>ぎゅうにゅう</rt></ruby>を買いました。<ruby>時計 <rt className="text-amber-500/60 font-mono text-[10px]">とけい</rt></ruby>を見ると、時間がもう遅いです。<ruby>お父さん <rt className="text-amber-500/60 font-mono text-[10px]">おとうさん</rt></ruby>と<ruby>お兄さん <rt className="text-amber-500/60 font-mono text-[10px]">おにいさん</rt></ruby>は<ruby>車 <rt className="text-amber-500/60 font-mono text-[10px]">くるま</rt></ruby>で来ます。私は<ruby>椅子 <rt className="text-amber-500/60 font-mono text-[10px]">いす</rt></ruby>に座って、帽子を置いて彼らを待ちました。
                  </>
                ) : lesson.id === "Lesson 3" ? (
                  <>
                    <ruby>今週 <rt className="text-amber-500/60 font-mono text-[10px]">こんしゅう</rt></ruby>の<ruby>土曜日 <rt className="text-amber-500/60 font-mono text-[10px]">どようび</rt></ruby>はとても天気がいいです。<ruby>仕事 <rt className="text-amber-500/60 font-mono text-[10px]">しごと</rt></ruby>が休みなので、私は<ruby>自転車 <rt className="text-amber-500/60 font-mono text-[10px]">じてんしゃ</rt></ruby>で遠い川まで行きました。川の近くには大きな<ruby>木 <rt className="text-amber-500/60 font-mono text-[10px]">き</rt></ruby>があります。木の下で、美味しい<ruby>カレー <rt className="text-amber-500/60 font-mono text-[10px]">かれー</rt></ruby>を食べました。午後は<ruby>野球 <rt className="text-amber-500/60 font-mono text-[10px]">やきゅう</rt></ruby>の練習をします。それは難しいですが、面白いので大好きです。夜、家に帰って、お風呂を沸かして温かいお湯に入り、すぐに寝ました。
                  </>
                ) : lesson.id === "Lesson 4" ? (
                  <>
                    私たちは大学の<ruby>教室 <rt className="text-amber-500/60 font-mono text-[10px]">きょうしつ</rt></ruby>で<ruby>日本語 <rt className="text-amber-500/60 font-mono text-[10px]">にほんご</rt></ruby>を習っています。<ruby>先生 <rt className="text-amber-500/60 font-mono text-[10px]">せんせい</rt></ruby>は<ruby>漢字 <rt className="text-amber-500/60 font-mono text-[10px]">かんじ</rt></ruby>と<ruby>文法 <rt className="text-amber-500/60 font-mono text-[10px]">ぶんぽう</rt></ruby>を優しく教え、授業が終わってから、私は友達と<ruby>図書館 <rt className="text-amber-500/60 font-mono text-[10px]">としょかん</rt></ruby>に行きました。パソコンを使って学校の<ruby>宿題 <rt className="text-amber-500/60 font-mono text-[10px]">しゅくだい</rt></ruby>をします。お腹が空いたので、<ruby>食堂 <rt className="text-amber-500/60 font-mono text-[10px]">しょくどう</rt></ruby>で美味しい<ruby>ご飯 <rt className="text-amber-500/60 font-mono text-[10px]">ごはん</rt></ruby>を食べました。
                  </>
                ) : (
                  story.japanese
                )}
              </p>
            ) : (
              renderInteractiveText()
            )}
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
