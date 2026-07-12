const fs = require("fs");
const path = require("path");

const vocabPath = path.join(__dirname, "generated_vocab_index.json");
const freqPath = path.join(__dirname, "source", "netem_full_list.json");
const outputPath = path.join(__dirname, "story_catalog.js");

const vocabData = JSON.parse(fs.readFileSync(vocabPath, "utf8"));
const freqData = JSON.parse(fs.readFileSync(freqPath, "utf8"));
const freqList = freqData[Object.keys(freqData)[0]];

const meaningMap = new Map();
for (const item of freqList) {
  const keys = Object.keys(item);
  const word = String(item[keys[2]] || "").trim().toLowerCase();
  const meaning = String(item[keys[3]] || "").trim();
  if (word && !meaningMap.has(word)) {
    meaningMap.set(word, meaning);
  }
}

const groups = [];
for (let i = 0; i < vocabData.entries.length; i += 50) {
  const slice = vocabData.entries.slice(i, i + 50);
  const storyNo = String(groups.length + 1).padStart(3, "0");
  const start = slice[0].learnId;
  const end = slice[slice.length - 1].learnId;
  groups.push({
    id: `story-${storyNo}`,
    storyNo,
    title: `Story ${storyNo}`,
    range: `${start}-${end}`,
    count: slice.length,
    theme: storyNo === "001" ? "社区阅读" : "待生成",
    status: storyNo === "001" ? "completed" : "queued",
    preview: `${slice[0].word} · ${slice[1]?.word || ""} · ${slice[2]?.word || ""}`,
    vocabulary: slice.map((entry) => ({
      id: entry.learnId,
      sourceId: entry.sourceId,
      word: entry.word,
      meaning: meaningMap.get(entry.word) || ""
    }))
  });
}

const payload = `window.STORY_CATALOG = ${JSON.stringify(
  {
    metadata: {
      totalWords: vocabData.entries.length,
      totalStories: groups.length,
      pageSize: 12,
      generatedAt: new Date().toISOString()
    },
    groups
  },
  null,
  2
)};\n`;

fs.writeFileSync(outputPath, payload, "utf8");
console.log(`Generated ${outputPath} with ${groups.length} story groups.`);
