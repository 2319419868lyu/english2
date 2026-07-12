const fs = require("fs");
const path = require("path");

const sourcePath = path.join(__dirname, "source", "kaoyan_2025_5500_source.txt");
const priorityPath = path.join(__dirname, "priority_words.txt");
const outputPath = path.join(__dirname, "generated_vocab_index.json");

function pad(num) {
  return String(num).padStart(4, "0");
}

function readLines(filePath) {
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const sourceLines = readLines(sourcePath);
const priorityLines = readLines(priorityPath).map((word) => word.toLowerCase());

const uniqueSource = [];
const seen = new Set();

sourceLines.forEach((word, index) => {
  const normalized = word.toLowerCase();
  if (seen.has(normalized)) {
    return;
  }
  seen.add(normalized);
  uniqueSource.push({
    sourceId: pad(index + 1),
    word: normalized
  });
});

const sourceMap = new Map(uniqueSource.map((entry) => [entry.word, entry]));
const missingPriority = priorityLines.filter((word) => !sourceMap.has(word));

if (missingPriority.length) {
  throw new Error(`Priority words missing from source list: ${missingPriority.join(", ")}`);
}

const prioritySet = new Set(priorityLines);

const ordered = [
  ...priorityLines.map((word) => ({ ...sourceMap.get(word), bucket: "priority" })),
  ...uniqueSource
    .filter((entry) => !prioritySet.has(entry.word))
    .map((entry) => ({ ...entry, bucket: "standard" }))
].map((entry, index) => ({
  learnId: pad(index + 1),
  sourceId: entry.sourceId,
  word: entry.word,
  bucket: entry.bucket
}));

const payload = {
  metadata: {
    sourceFile: "source/kaoyan_2025_5500_source.txt",
    priorityFile: "priority_words.txt",
    totalSourceLines: sourceLines.length,
    totalUniqueWords: uniqueSource.length,
    priorityCount: priorityLines.length,
    generatedAt: new Date().toISOString()
  },
  entries: ordered
};

fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Generated ${outputPath} with ${ordered.length} ordered entries.`);
