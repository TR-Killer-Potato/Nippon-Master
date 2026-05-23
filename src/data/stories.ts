export interface ReadingPassage {
  title: string;
  japanese: string;
  english: string;
  vocabularyHighlights: { word: string; reading: string; meaning: string }[];
}

export const storiesMap: Record<string, ReadingPassage> = {
  "Lesson 1": {
    title: "A Student's Favorite Things (学生の大好きなもの)",
    japanese: "私は学生です。本を読みます。私の家には可愛い猫がいます。猫の名前は「たま」です。私は海と映画が大好きです。明日は月曜日です。月曜日は忙しいですが、友達に会うので大丈夫です。冷たい水を飲んで、元気に勉強を頑張ります。",
    english: "I am a student. I read books. In my house, there is a cute cat. The cat's name is 'Tama'. I love the sea and movies. Tomorrow is Monday. Monday is busy, but it is fine because I will meet my friend. I will drink cold water and study with high spirits.",
    vocabularyHighlights: [
      { word: "学生", reading: "がくせい", meaning: "Student" },
      { word: "本", reading: "ほん", meaning: "Book" },
      { word: "猫", reading: "ねこ", meaning: "Cat" },
      { word: "家", reading: "いえ/うち", meaning: "House/Home" },
      { word: "海", reading: "うみ", meaning: "Sea" },
      { word: "映画", reading: "えいが", meaning: "Movie" },
      { word: "明日", reading: "あした", meaning: "Tomorrow" },
      { word: "月曜日", reading: "げつようび", meaning: "Monday" },
      { word: "友達", reading: "ともだち", meaning: "Friend" },
      { word: "水", reading: "みず", meaning: "Water" }
    ]
  },
  "Lesson 2": {
    title: "At the Station Café (駅のカフェで)",
    japanese: "昨日、私は駅の近くのホテルに行きました。駅には新しいコンビニとカフェがあります。私はカフェでパンと牛乳を買いました。時計を見ると、時間がもう遅いです。お父さんとお兄さんは車で来ます。私は椅子に座って、帽子を置いて彼らを待ちました。",
    english: "Yesterday, I went to a hotel near the station. There is a new convenience store and café at the station. I bought bread and cow's milk at the café. Looking at my watch, the time is already late. My father and older brother will come by car. I sat down on a chair, placed down my hat, and waited for them.",
    vocabularyHighlights: [
      { word: "昨日", reading: "きのう", meaning: "Yesterday" },
      { word: "駅", reading: "えき", meaning: "Station" },
      { word: "ホテル", reading: "ほてる", meaning: "Hotel" },
      { word: "パン", reading: "ぱん", meaning: "Bread" },
      { word: "牛乳", reading: "ぎゅうにゅう", meaning: "Cow's milk" },
      { word: "時計", reading: "とけい", meaning: "Watch/clock" },
      { word: "お父さん", reading: "おとうさん", meaning: "Father" },
      { word: "お兄さん", reading: "おにいさん", meaning: "Older brother" },
      { word: "車", reading: "くるま", meaning: "Car" },
      { word: "椅子", reading: "いす", meaning: "Chair" }
    ]
  },
  "Lesson 3": {
    title: "A Pleasant Weekend (楽しい週末)",
    japanese: "今週の土曜日はとても天気がいいです。仕事が休みなので、私は自転車で遠い川まで行きました。川の近くには大きな木があります。木の下で、美味しいカレーを食べました。午後は野球の練習をします。それは難しいですが、面白いので大好きです。夜、家に帰って、お風呂を沸かして温かいお湯に入り、すぐに寝ました。",
    english: "This week's Saturday has very nice weather. Since my job is off, I went to a far river by bicycle. There is a big tree near the river. Under the tree, I ate delicious curry. In the afternoon, I will practice baseball. It is difficult, but I love it because it is interesting. In the evening, I returned home, filled up the bath to enter warm water, and went to bed immediately.",
    vocabularyHighlights: [
      { word: "今週", reading: "こんしゅう", meaning: "This week" },
      { word: "土曜日", reading: "どようび", meaning: "Saturday" },
      { word: "仕事", reading: "しごと", meaning: "Work/job" },
      { word: "自転車", reading: "じてんしゃ", meaning: "Bicycle" },
      { word: "木", reading: "き", meaning: "Tree" },
      { word: "美味しい", reading: "おいしい", meaning: "Delicious" },
      { word: "カレー", reading: "かれー", meaning: "Curry" },
      { word: "野球", reading: "やきゅう", meaning: "Baseball" },
      { word: "お風呂", reading: "おふろ", meaning: "Bath" },
      { word: "温かい", reading: "あたたかい", meaning: "Warm" }
    ]
  },
  "Lesson 4": {
    title: "Learning Japanese After Class (クラスのあとの日本語勉強)",
    japanese: "私たちは大学の教室で日本語を習っています。先生は漢字と文法を優しく教えます。今日の授業が終わってから、私は友達と図書館に行きました。パソコンを使って学校の宿題をします。お腹が空いたので、食堂で美味しいご飯を食べました。それから、男の子と女の子がテニスの練習をしているのを見て、私たちは帰りました。",
    english: "We are learning Japanese in the university classroom. The teacher teaches kanji and grammar kindly. After today's lesson ended, I went to the library with my friend. We use computers to do school homework. Because I became hungry, I ate delicious rice at the dining hall. After that, watching a boy and a girl practicing tennis, we returned home.",
    vocabularyHighlights: [
      { word: "教室", reading: "きょうしつ", meaning: "Classroom" },
      { word: "日本語", reading: "にほんご", meaning: "Japanese" },
      { word: "先生", reading: "せんせい", meaning: "Teacher" },
      { word: "漢字", reading: "かんじ", meaning: "Kanji / Chinese characters" },
      { word: "文法", reading: "ぶんぽう", meaning: "Grammar" },
      { word: "宿題", reading: "しゅくだい", meaning: "Homework" },
      { word: "図書館", reading: "としょかん", meaning: "Library" },
      { word: "ご飯", reading: "ごはん", meaning: "Meal/rice" },
      { word: "食堂", reading: "しょくどう", meaning: "Dining room/cafeteria" }
    ]
  }
};

// Fallback generator for remaining lessons so they all have reading passages
export function getStoryForLesson(lessonId: string): ReadingPassage {
  if (storiesMap[lessonId]) {
    return storiesMap[lessonId];
  }
  
  // Dynamic mock builder so Lessons 5-22 all work beautifully
  return {
    title: `${lessonId} Comprehension (読解)`,
    japanese: `これは${lessonId}のリーディング文章です。このレッスンでは、重要語彙や、自然な表現の練習をしています。新しい文法を覚えて、言葉の幅を広げましょう。毎日少しずつ勉強を続けることが、日本語脳を作る上での一番の近道です。`,
    english: `This is the reading passage for ${lessonId}. In this lesson, we practice essential vocabulary and natural expressions. Let's memorize new grammar to expand our expressive capacity. Continuing to study a bit every day is the best shortcut to designing a Japanese language brain.`,
    vocabularyHighlights: [
      { word: "重要", reading: "じゅうよう", meaning: "Essential / Important" },
      { word: "練習", reading: "れんしゅう", meaning: "Practice" },
      { word: "毎日", reading: "まいにち", meaning: "Every day" },
      { word: "勉強", reading: "べんきょう", meaning: "Study" }
    ]
  };
}
export default storiesMap;
