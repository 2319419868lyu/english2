const fs = require("fs");
const path = require("path");

const sourcePath = path.join(__dirname, "source", "kaoyan_2025_5500_source.txt");
const corePath = path.join(__dirname, "source", "kaoyan2_core_2371.txt");
const netemPath = path.join(__dirname, "source", "netem_full_list.json");
const outputWordsPath = path.join(__dirname, "priority_words.txt");
const outputMetaPath = path.join(__dirname, "priority_words_meta.json");

function readLines(filePath) {
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const sourceWords = [...new Set(readLines(sourcePath).map((word) => word.toLowerCase()))];
const sourceOrder = new Map(sourceWords.map((word, index) => [word, index]));

const coreLines = readLines(corePath);
const coreWords = [];
for (const line of coreLines) {
  const match = line.match(/^\s*(\d+)\s+([A-Za-z][A-Za-z'-]*)\s*$/);
  if (match) {
    coreWords.push(match[2].toLowerCase());
  }
}
const coreUnique = [...new Set(coreWords)];

const netemRaw = JSON.parse(fs.readFileSync(netemPath, "utf8"));
const netemList = netemRaw[Object.keys(netemRaw)[0]];
const netemRank = new Map();
const netemFreq = new Map();
const netemSub = new Map();

for (const item of netemList) {
  const keys = Object.keys(item);
  const rank = Number(item[keys[0]] || 999999);
  const freq = Number(item[keys[1]] || 0);
  const word = String(item[keys[2]] || "").trim().toLowerCase();
  const sub = String(item[keys[6]] || "").trim();
  if (word && !netemRank.has(word)) {
    netemRank.set(word, rank);
    netemFreq.set(word, freq);
    netemSub.set(word, sub);
  }
}

const matched = coreUnique.filter((word) => sourceOrder.has(word));
const missing = coreUnique.filter((word) => !sourceOrder.has(word));
const blockedWords = new Set([
  "but",
  "should",
  "just",
  "once",
  "less",
  "both",
  "while",
  "still",
  "might",
  "right",
  "without",
  "whether",
  "yet",
  "rather",
  "least"
]);

const filtered = matched.filter((word) => {
  if (blockedWords.has(word)) {
    return false;
  }
  const sub = netemSub.get(word) || "";
  if (sub.includes("基础功能词") || sub.includes("逻辑与关系")) {
    return false;
  }
  return word.length > 2;
});

const sorted = filtered.slice().sort((a, b) => {
  const ar = netemRank.has(a) ? netemRank.get(a) : 999999;
  const br = netemRank.has(b) ? netemRank.get(b) : 999999;
  if (ar !== br) {
    return ar - br;
  }
  return sourceOrder.get(a) - sourceOrder.get(b);
});

fs.writeFileSync(outputWordsPath, `${sorted.join("\n")}\n`, "utf8");

const meta = {
  generatedAt: new Date().toISOString(),
  method: [
    "原始总词表来源：source/kaoyan_2025_5500_source.txt",
    "重点候选来源：source/kaoyan2_core_2371.txt（英语二核心高频词表）",
    "排序依据：source/netem_full_list.json（考研词频排序表）",
    "生成规则：先取英语二核心词中与总词表重合的词，去掉明显功能词和连接词，再按考研词频排序。"
  ],
  stats: {
    sourceUnique: sourceWords.length,
    coreUnique: coreUnique.length,
    matchedPriority: matched.length,
    filteredPriority: filtered.length,
    missingFromSource: missing.length,
    rankedInNetem: sorted.filter((word) => netemRank.has(word)).length
  },
  first50: sorted.slice(0, 50).map((word, index) => ({
    learnId: String(index + 1).padStart(4, "0"),
    word,
    netemRank: netemRank.get(word) ?? null,
    netemFreq: netemFreq.get(word) ?? null
  })),
  sampleMissing: missing.slice(0, 100)
};

fs.writeFileSync(outputMetaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
console.log(`Generated ${sorted.length} priority words.`);
