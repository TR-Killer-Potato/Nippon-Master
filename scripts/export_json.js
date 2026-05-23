import fs from 'fs';
import path from 'path';
import { lessonsListMap } from '../src/data/lessons.js';

// Setup directories
const publicDir = path.resolve('./public');
const quizdataDir = path.resolve('./public/quizdata');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
if (!fs.existsSync(quizdataDir)) {
  fs.mkdirSync(quizdataDir);
}

// 1. Generate quizdata/lXX.json
const lessonsKeys = Object.keys(lessonsListMap);
const lessonsMeta = [];

lessonsKeys.forEach((key, index) => {
  const fileNum = String(index + 1).padStart(2, '0');
  const fileName = `quizdata/l${fileNum}.json`;
  
  lessonsMeta.push({
    id: key,
    file: fileName
  });
  
  const lesson = lessonsListMap[key];
  const items = lesson.vocabulary.map(compact => ({
    v: compact[0],
    r: compact[1],
    m: compact[2],
    isReadingRedundant: compact[3] === 1,
    dv: compact[4],
    dr: compact[5],
    dm: compact[6]
  }));
  
  const output = {
    title: lesson.title,
    vocabulary: items
  };
  
  fs.writeFileSync(
    path.join(quizdataDir, `l${fileNum}.json`),
    JSON.stringify(output, null, 2)
  );
  console.log(`Generated public/quizdata/l${fileNum}.json`);
});

// 2. Generate manifest.json
fs.writeFileSync(
  path.join(publicDir, 'manifest.json'),
  JSON.stringify({ lessons: lessonsMeta }, null, 2)
);
console.log('Generated public/manifest.json successfully!');
