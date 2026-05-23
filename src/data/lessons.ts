import { l01, l02, l03, CompactVocab } from "./lessons/l01_l03";
import { l04, l05, l06 } from "./lessons/l04_l06";
import { l07, l08, l09 } from "./lessons/l07_l09";
import { l10, l11, l12 } from "./lessons/l10_l12";
import { l13, l14, l15 } from "./lessons/l13_l15";
import { l16, l17, l18 } from "./lessons/l16_l18";
import { l19, l20, l21, l22 } from "./lessons/l19_l22";

export interface ExpandedVocab {
  v: string;
  r: string;
  m: string;
  isReadingRedundant: boolean;
  dv: string[];
  dr: string[];
  dm: string[];
}

export interface ExpandedLesson {
  id: string;
  title: string;
  vocabulary: ExpandedVocab[];
}

export function expandVocab(compact: CompactVocab): ExpandedVocab {
  return {
    v: compact[0],
    r: compact[1],
    m: compact[2],
    isReadingRedundant: compact[3] === 1,
    dv: compact[4],
    dr: compact[5],
    dm: compact[6]
  };
}

export const lessonsListMap: Record<string, any> = {
  "Lesson 1": l01,
  "Lesson 2": l02,
  "Lesson 3": l03,
  "Lesson 4": l04,
  "Lesson 5": l05,
  "Lesson 6": l06,
  "Lesson 7": l07,
  "Lesson 8": l08,
  "Lesson 9": l09,
  "Lesson 10": l10,
  "Lesson 11": l11,
  "Lesson 12": l12,
  "Lesson 13": l13,
  "Lesson 14": l14,
  "Lesson 15": l15,
  "Lesson 16": l16,
  "Lesson 17": l17,
  "Lesson 18": l18,
  "Lesson 19": l19,
  "Lesson 20": l20,
  "Lesson 21": l21,
  "Lesson 22": l22,
};

export const allLessons: ExpandedLesson[] = Object.keys(lessonsListMap).map((key) => {
  const lesson = lessonsListMap[key];
  return {
    id: key,
    title: lesson.title,
    vocabulary: lesson.vocabulary.map(expandVocab)
  };
});
