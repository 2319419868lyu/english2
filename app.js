const PAGE_SIZE = window.STORY_CATALOG?.metadata?.pageSize || 12;

const storyListEl = document.getElementById("story-list");
const storyCountEl = document.getElementById("story-count");
const catalogPageEl = document.getElementById("catalog-page");
const storyRangeEl = document.getElementById("story-range");
const storyTitleEl = document.getElementById("story-title");
const storySubtitleEl = document.getElementById("story-subtitle");
const themePillEl = document.getElementById("theme-pill");
const storyStatusEl = document.getElementById("story-status");
const wordBankNoteEl = document.getElementById("word-bank-note");
const wordBankEl = document.getElementById("word-bank");
const vocabStoryEl = document.getElementById("vocab-story");
const readingNoteEl = document.getElementById("reading-note");
const readingPassageEl = document.getElementById("reading-passage");
const vocabSourceNoteEl = document.getElementById("vocab-source-note");
const quizFormEl = document.getElementById("quiz-form");
const resultBoxEl = document.getElementById("result-box");
const analysisPanelEl = document.getElementById("analysis-panel");
const analysisListEl = document.getElementById("analysis-list");
const checkBtn = document.getElementById("check-btn");
const resetBtn = document.getElementById("reset-btn");
const toggleInlineGlossBtn = document.getElementById("toggle-inline-gloss");
const toggleReadingTranslationBtn = document.getElementById("toggle-reading-translation");
const toggleAnswerPanelBtn = document.getElementById("toggle-answer-panel");
const catalogPrevBtn = document.getElementById("catalog-prev");
const catalogNextBtn = document.getElementById("catalog-next");

let activeStoryId = window.STORY_CATALOG?.groups?.[0]?.id || "story-001";
let catalogPage = 0;
let showInlineGloss = false;
let showReadingTranslation = false;
let showAnswerPanel = false;

function getCatalogEntry(storyId = activeStoryId) {
  return window.STORY_CATALOG.groups.find((group) => group.id === storyId);
}

function getContentEntry(storyId = activeStoryId) {
  return window.STORY_CONTENT?.[storyId] || null;
}

function getMergedStory(storyId = activeStoryId) {
  const catalogEntry = getCatalogEntry(storyId);
  const contentEntry = getContentEntry(storyId);
  return {
    ...catalogEntry,
    ...(contentEntry || {}),
    vocabulary: contentEntry?.vocabulary || catalogEntry.vocabulary,
    status: contentEntry ? "completed" : catalogEntry.status
  };
}

function renderMarkedText(text) {
  return text.replace(/\[\[(.+?)\|(.+?)\]\]/g, (_, word, meaning) => {
    const glossClass = showInlineGloss ? "inline-gloss" : "inline-gloss hidden";
    return `<span class="word-mark">${word}</span><span class="${glossClass}">（${meaning}）</span>`;
  });
}

function renderStoryList() {
  const groups = window.STORY_CATALOG.groups;
  const totalPages = Math.ceil(groups.length / PAGE_SIZE);
  const start = catalogPage * PAGE_SIZE;
  const visible = groups.slice(start, start + PAGE_SIZE);

  storyCountEl.textContent = `${groups.length} 篇`;
  catalogPageEl.textContent = `${catalogPage + 1} / ${totalPages}`;
  catalogPrevBtn.disabled = catalogPage === 0;
  catalogNextBtn.disabled = catalogPage >= totalPages - 1;

  storyListEl.innerHTML = "";
  visible.forEach((group) => {
    const story = getMergedStory(group.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `story-item${group.id === activeStoryId ? " active" : ""}`;
    const statusText = story.status === "completed" ? "已完成" : "待生成";
    button.innerHTML = `
      <strong>${story.title}</strong>
      <span>${story.range} · ${story.count} 词</span>
      <small class="${story.status}">${statusText} · ${story.preview}</small>
    `;
    button.addEventListener("click", () => {
      activeStoryId = group.id;
      renderAll();
    });
    storyListEl.appendChild(button);
  });
}

function renderWordBank(story) {
  wordBankEl.innerHTML = story.vocabulary
    .map(
      (item) => `
        <article class="word-chip">
          <strong>${item.word}</strong>
          <p>${item.meaning || "释义待补充"}</p>
        </article>
      `
    )
    .join("");
}

function renderVocabStory(story) {
  if (!story.vocabStory) {
    vocabStoryEl.innerHTML = `
      <article class="empty-card">
        <h4>该篇内容尚未写作</h4>
        <p class="empty-note">这一篇的词汇范围已经归档完成，但中文故事和阅读题还没有生成。你可以先看本篇词表，后续再继续补内容。</p>
      </article>
    `;
    return;
  }

  vocabStoryEl.innerHTML = story.vocabStory
    .map((sentence) => `<p class="cn-story-line">${renderMarkedText(sentence)}</p>`)
    .join("");
}

function renderReadingPassage(story) {
  if (!story.reading?.passage?.length) {
    readingPassageEl.innerHTML = `
      <article class="empty-card">
        <h4>阅读理解待生成</h4>
        <p class="empty-note">该篇的阅读理解题、句对句中文和解析还没有写入。目录和词库顺序已经固定，不会丢失编号。</p>
      </article>
    `;
    return;
  }

  readingPassageEl.innerHTML = story.reading.passage
    .map(
      (item) => `
        <article class="sentence-card">
          <p class="sentence-en">${renderMarkedText(item.en)}</p>
          <p class="sentence-zh${showReadingTranslation ? "" : " hidden"}">${item.zh}</p>
        </article>
      `
    )
    .join("");
}

function renderQuiz(story) {
  if (!story.reading?.questions?.length) {
    quizFormEl.innerHTML = "";
    return;
  }

  quizFormEl.innerHTML = story.reading.questions
    .map(
      (question) => `
        <fieldset class="question-card">
          <legend>第 ${question.id} 题</legend>
          <h4>${question.stem}</h4>
          <div class="question-type">${question.type}</div>
          ${Object.entries(question.options)
            .map(
              ([key, value]) => `
                <label class="option" data-question="${question.id}" data-option="${key}">
                  <input type="radio" name="q-${question.id}" value="${key}">
                  <span><strong>${key}.</strong> ${value}</span>
                </label>
              `
            )
            .join("")}
        </fieldset>
      `
    )
    .join("");
}

function renderAnalysis(story) {
  if (!story.reading?.questions?.length) {
    analysisListEl.innerHTML = "";
    return;
  }

  analysisListEl.innerHTML = story.reading.questions
    .map(
      (question) => `
        <article class="analysis-item">
          <strong>${question.id}. ${question.type} · 正确答案 ${question.answer}</strong>
          <p>${question.explanation}</p>
        </article>
      `
    )
    .join("");
}

function clearOptionStates() {
  document.querySelectorAll(".option").forEach((optionEl) => {
    optionEl.classList.remove("correct", "incorrect");
  });
}

function resetQuiz() {
  if (typeof quizFormEl.reset === "function") {
    quizFormEl.reset();
  }
  clearOptionStates();
  resultBoxEl.className = "result-box";
  const story = getMergedStory();
  resultBoxEl.textContent = story.reading?.questions?.length
    ? "完成阅读后提交答案，系统会标出正确项；答案解析默认隐藏，需要时再展开。"
    : "该篇阅读理解还没有生成，当前先用于目录归档和词汇占位。";
}

function checkAnswers() {
  const story = getMergedStory();
  if (!story.reading?.questions?.length) {
    resultBoxEl.className = "result-box error";
    resultBoxEl.textContent = "该篇还没有阅读题，暂时无法判分。";
    return;
  }

  let score = 0;
  let answered = 0;
  clearOptionStates();

  story.reading.questions.forEach((question) => {
    const selected = quizFormEl.querySelector(`input[name="q-${question.id}"]:checked`);
    const correctLabel = quizFormEl.querySelector(
      `[data-question="${question.id}"][data-option="${question.answer}"]`
    );
    if (correctLabel) {
      correctLabel.classList.add("correct");
    }
    if (selected) {
      answered += 1;
      if (selected.value === question.answer) {
        score += 1;
      } else {
        selected.closest(".option")?.classList.add("incorrect");
      }
    }
  });

  if (answered < story.reading.questions.length) {
    resultBoxEl.className = "result-box error";
    resultBoxEl.textContent = `你目前完成了 ${answered}/${story.reading.questions.length} 题。建议先全部做完，再统一复盘。`;
    return;
  }

  resultBoxEl.className = "result-box success";
  resultBoxEl.textContent = `本篇得分：${score}/${story.reading.questions.length}。你可以继续自己复盘，或再打开左侧“答案解析”。`;
}

function syncToggleLabels() {
  toggleInlineGlossBtn.textContent = showInlineGloss ? "隐藏词后释义" : "显示词后释义";
  toggleReadingTranslationBtn.textContent = showReadingTranslation ? "隐藏阅读中文" : "显示阅读中文";
  toggleAnswerPanelBtn.textContent = showAnswerPanel ? "隐藏答案解析" : "显示答案解析";
}

function syncCatalogPage() {
  const index = window.STORY_CATALOG.groups.findIndex((group) => group.id === activeStoryId);
  if (index >= 0) {
    catalogPage = Math.floor(index / PAGE_SIZE);
  }
}

function renderAll() {
  const story = getMergedStory();
  syncCatalogPage();
  renderStoryList();

  storyRangeEl.textContent = `词汇编号 ${story.range}`;
  storyTitleEl.textContent = story.title;
  storySubtitleEl.textContent = story.subtitle || "目录已归档，等待生成本篇正文。";
  themePillEl.textContent = story.theme || "待生成";
  storyStatusEl.textContent = story.status === "completed" ? "已完成正文" : "仅完成目录与词表";
  storyStatusEl.className = `status-pill${story.status === "completed" ? "" : " queued"}`;
  wordBankNoteEl.textContent =
    story.status === "completed"
      ? "本篇正文已完成，词表和正文绑定。"
      : "本篇词表已锁定，正文和题目后续按这一组继续生成。";
  readingNoteEl.textContent = story.readingNote || "该篇尚未生成阅读短文与题目。";
  vocabSourceNoteEl.textContent = `总词数 ${window.STORY_CATALOG.metadata.totalWords}，共 ${window.STORY_CATALOG.metadata.totalStories} 篇，当前查看 ${story.id}。`;

  renderWordBank(story);
  renderVocabStory(story);
  renderReadingPassage(story);
  renderQuiz(story);
  renderAnalysis(story);
  analysisPanelEl.classList.toggle("hidden", !showAnswerPanel || !story.reading?.questions?.length);
  syncToggleLabels();
  resetQuiz();
}

toggleInlineGlossBtn.addEventListener("click", () => {
  showInlineGloss = !showInlineGloss;
  renderAll();
});

toggleReadingTranslationBtn.addEventListener("click", () => {
  showReadingTranslation = !showReadingTranslation;
  renderReadingPassage(getMergedStory());
  syncToggleLabels();
});

toggleAnswerPanelBtn.addEventListener("click", () => {
  showAnswerPanel = !showAnswerPanel;
  analysisPanelEl.classList.toggle(
    "hidden",
    !showAnswerPanel || !getMergedStory().reading?.questions?.length
  );
  syncToggleLabels();
});

catalogPrevBtn.addEventListener("click", () => {
  if (catalogPage > 0) {
    catalogPage -= 1;
    renderStoryList();
  }
});

catalogNextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(window.STORY_CATALOG.groups.length / PAGE_SIZE);
  if (catalogPage < totalPages - 1) {
    catalogPage += 1;
    renderStoryList();
  }
});

checkBtn.addEventListener("click", checkAnswers);
resetBtn.addEventListener("click", resetQuiz);

renderAll();
