const fs = require("fs");
const path = require("path");
const vm = require("vm");

const catalogPath = path.join(__dirname, "story_catalog.js");
const existingStoriesPath = path.join(__dirname, "stories.js");
const outputStoriesPath = path.join(__dirname, "stories.js");
const archivePath = path.join(__dirname, "story_archive.json");

function loadWindowObject(filePath, key) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), sandbox);
  return sandbox.window[key];
}

const catalog = loadWindowObject(catalogPath, "STORY_CATALOG");
const existing = loadWindowObject(existingStoriesPath, "STORY_CONTENT");

const themePool = [
  { title: "河岸边的旧仓库", theme: "城市更新", place: "河岸边的旧仓库", group: "小组", lead: "祁安" },
  { title: "凌晨四点的广播站", theme: "校园媒体", place: "凌晨四点的广播站", group: "编辑部", lead: "闻溪" },
  { title: "被风吹亮的山路", theme: "乡村教育", place: "被风吹亮的山路", group: "志愿队", lead: "沈乔" },
  { title: "雨季后的苗圃名单", theme: "生态计划", place: "雨季后的苗圃", group: "实践组", lead: "迟叙" },
  { title: "旧剧场的最后一盏灯", theme: "公共文化", place: "旧剧场", group: "策划组", lead: "林岑" },
  { title: "桥下市场的晨会", theme: "地方商业", place: "桥下市场", group: "调研队", lead: "顾衡" },
  { title: "深夜诊室外的长椅", theme: "公共健康", place: "深夜诊室外", group: "服务队", lead: "周澈" },
  { title: "展柜背后的清单", theme: "博物馆教育", place: "展柜后的小资料室", group: "项目组", lead: "姜栖" },
  { title: "北站天桥的回声", theme: "城市交通", place: "北站天桥", group: "观察组", lead: "程遇" },
  { title: "修复室里的蓝图", theme: "文物修复", place: "修复室", group: "协作组", lead: "许遐" }
];

const questionSet = [
  {
    id: 1,
    type: "细节理解",
    stem: "According to the passage, the team's work began mainly with",
    answer: "B",
    explanation: "文章开头强调，小组先整理线索、记录和关键词，再据此推进任务，因此 B 最符合。 ",
    options: {
      A: "seeking outside awards",
      B: "sorting practical clues and observations",
      C: "building a final model at once",
      D: "ignoring local conditions"
    }
  },
  {
    id: 2,
    type: "推断判断",
    stem: "What can be inferred about the group members from the passage?",
    answer: "C",
    explanation: "通篇都强调成员在反复讨论、修正和合作中推进任务，因此可推知他们的进展依赖持续协作。 ",
    options: {
      A: "They cared only about technical speed.",
      B: "They avoided all disagreement.",
      C: "They moved forward through repeated cooperation.",
      D: "They depended entirely on one leader."
    }
  },
  {
    id: 3,
    type: "词义猜测",
    stem: "The word \"framework\" in the passage is closest in meaning to",
    answer: "A",
    explanation: "framework 在文中表示任务得以展开的整体结构和组织方式，因此 A 最贴切。 ",
    options: {
      A: "basic structure",
      B: "public celebration",
      C: "private memory",
      D: "financial reward"
    }
  },
  {
    id: 4,
    type: "主旨概括",
    stem: "Which of the following best states the main idea of the passage?",
    answer: "D",
    explanation: "全文主旨是说明，一个项目的价值来自持续观察、协作与把零散线索组织成可行动的方案。 ",
    options: {
      A: "Local projects are mainly limited by money.",
      B: "Public tasks should be completed individually.",
      C: "The best results come from quick decisions alone.",
      D: "Meaningful work grows through organized attention and cooperation."
    }
  },
  {
    id: 5,
    type: "写作目的",
    stem: "The author writes the passage mainly to",
    answer: "B",
    explanation: "作者是在说明小组如何把复杂线索转成持续推进的任务，并借此展示实践学习的意义。 ",
    options: {
      A: "compare two unrelated institutions",
      B: "show how a project gains depth through collective work",
      C: "prove that all public spaces should be redesigned",
      D: "argue that reading is less important than action"
    }
  }
];

function mark(item) {
  return `[[${item.word}|${item.meaning || "释义"}]]`;
}

function sentenceGroups(items, sizes) {
  const groups = [];
  let index = 0;
  for (const size of sizes) {
    groups.push(items.slice(index, index + size));
    index += size;
  }
  return groups;
}

function buildChineseStory(group, themeInfo) {
  const items = group.vocabulary;
  const chunks = sentenceGroups(items, [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2]);
  const c = chunks.map((chunk) => chunk.map(mark));
  return [
    `${themeInfo.lead}第一次走进${themeInfo.place}时，桌上已经摆好了三张词卡：${c[0][0]}、${c[0][1]}、${c[0][2]}，像有人提前替这场任务写下了序章。`,
    `负责带队的老师说，这次${themeInfo.group}不能只看表面，要顺着${c[1][0]}去找真正的${c[1][1]}，再判断每一步该朝哪个${c[1][2]}继续。`,
    `${themeInfo.lead}原本以为这只是普通差事，可当她把${c[2][0]}和${c[2][1]}写进记录本时，才发现每个细节都在重新定义工作的${c[2][2]}。`,
    `他们先去整理散落的材料，把${c[3][0]}、${c[3][1]}和${c[3][2]}分成三类，试着从最杂乱的地方找出稳定的线索。`,
    `有人提议先做小范围访谈，有人主张直接行动，可${themeInfo.lead}更想把${c[4][0]}留到最后，再观察真正重要的${c[4][1]}是否会自己浮现。`,
    `事情并没有想象中顺利，因为每个人理解的${c[5][0]}都不同，连同一份${c[5][1]}在不同人嘴里也会变成完全不同的${c[5][2]}。`,
    `于是他们开始反复核对，把墙上的便签换了一轮又一轮，直到${c[6][0]}和${c[6][1]}终于能在同一张图上彼此呼应。`,
    `${themeInfo.lead}慢慢发现，真正推动项目的并不是一次天才决定，而是大家愿意为${c[7][0]}、${c[7][1]}和${c[7][2]}这些小问题停下来。`,
    `夜深以后，${themeInfo.place}只剩灯声和纸页摩擦的声音，桌角那几张写着${c[8][0]}、${c[8][1]}、${c[8][2]}的卡片忽然像在提醒他们别走得太快。`,
    `第二天回看笔记时，${themeInfo.lead}第一次意识到，很多争论其实都围绕着同一件事：谁来承担${c[9][0]}，谁又真正理解了${c[9][1]}背后的代价。`,
    `后来他们去现场复查，把${c[10][0]}和${c[10][1]}贴在入口，把${c[10][2]}留在出口，想看看人们会先被哪一种提示打动。`,
    `结果出乎意料，最先引人停下脚步的并不是最醒目的装置，而是一段关于${c[11][0]}的小字说明，以及旁边顺手补上的${c[11][1]}。`,
    `这让${themeInfo.group}终于明白，项目真正缺少的不是热情，而是把${c[12][0]}、${c[12][1]}和${c[12][2]}组织成整体叙事的能力。`,
    `之后的几周里，他们一边修正方案，一边把新的${c[13][0]}继续加进模型，也学着在分歧里保住彼此的${c[13][1]}。`,
    `${themeInfo.lead}最喜欢黄昏时留在原地，看最后一束光落在那张写着${c[14][0]}和${c[14][1]}的旧纸上，像有人终于替他们完成了沉默的总结。`,
    `等汇报真正开始时，所有人已经不再急着证明自己，只想把一路积累下来的${c[15][0]}、${c[15][1]}和${c[15][2]}安安稳稳放进最终版本。`,
    `散场前，${themeInfo.lead}把最后两张词卡${c[16][0]}和${c[16][1]}轻轻夹回文件袋，忽然觉得这一晚真正被保存下来的，也许不是成果，而是共同做成一件事的勇气。`
  ];
}

function buildReadingPassage(group, themeInfo) {
  const items = group.vocabulary;
  const chunks = sentenceGroups(items, [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2]);
  const m = chunks.map((chunk) => chunk.map(mark));
  const en = [
    `The project in ${themeInfo.place} did not begin with a finished answer. It began when the team wrote down ${m[0][0]}, ${m[0][1]}, and ${m[0][2]} as the first practical clues.`,
    `Those words created a working framework, because each member had to ask how ${m[1][0]} might shape ${m[1][1]} and what kind of ${m[1][2]} the task truly required.`,
    `At first, several people thought the assignment would be simple. Soon, however, the group discovered that ${m[2][0]}, ${m[2][1]}, and ${m[2][2]} were connected in more ways than expected.`,
    `Instead of rushing forward, they paused to sort notes, compare interviews, and see whether ${m[3][0]} could explain the pattern behind ${m[3][1]} and ${m[3][2]}.`,
    `That slow method mattered, because practical work rarely depends on one dramatic moment; it depends on whether a team can return to ${m[4][0]} long enough to clarify ${m[4][1]} and refine ${m[4][2]}.`,
    `As the discussion continued, some members paid attention to public details, while others focused on the quieter pressure hidden inside ${m[5][0]}, ${m[5][1]}, and ${m[5][2]}.`,
    `The more evidence they gathered, the clearer it became that local decisions were shaped not by one cause but by the interaction among ${m[6][0]}, ${m[6][1]}, and ${m[6][2]}.`,
    `That is why the group refused to treat the task as a temporary show. They wanted their account of ${m[7][0]}, ${m[7][1]}, and ${m[7][2]} to remain useful after the event ended.`,
    `Field visits changed the project again, because real places often speak through small signs: a note on a wall, a delayed reply, or a missing explanation about ${m[8][0]}, ${m[8][1]}, and ${m[8][2]}.`,
    `By then, the members understood that cooperation meant more than dividing labor. It meant learning how to place ${m[9][0]} beside ${m[9][1]} without losing sight of ${m[9][2]}.`,
    `Some of the most productive conversations happened late, when people no longer defended their first opinions and instead compared what ${m[10][0]} might reveal about ${m[10][1]} and ${m[10][2]}.`,
    `Those exchanges helped the team see that public work gains depth when observation, memory, and revision keep moving between ${m[11][0]}, ${m[11][1]}, and ${m[11][2]}.`,
    `In the end, the group produced a stronger proposal not because every conflict disappeared, but because they turned disagreement into a way of testing ${m[12][0]}, ${m[12][1]}, and ${m[12][2]}.`,
    `Their final draft therefore looked calm, yet it contained weeks of hidden labor: reorganized notes, rewritten maps, and repeated efforts to connect ${m[13][0]} with ${m[13][1]}.`,
    `What impressed the reviewers most was not visual polish alone. It was the way the project kept returning to ${m[14][0]}, ${m[14][1]}, and ${m[14][2]} whenever an easy answer seemed too convenient.`,
    `Such persistence gave the work a different tone. It showed that collective learning can grow when people treat ${m[15][0]} and ${m[15][1]} as parts of the same living structure.`,
    `By the time the lights were turned off, even the last two notes, ${m[16][0]} and ${m[16][1]}, felt less like isolated vocabulary and more like evidence of shared attention.`
  ];
  const zh = [
    `这个发生在${themeInfo.place}的项目，并不是从一个现成答案开始的。它始于小组先写下了 ${chunks[0].map((x) => x.meaning || x.word).join("、")} 这些最初线索。`,
    `这些词构成了工作的框架，因为每个成员都得追问：某种变化如何塑造另一种结果，任务真正要求的又是什么。`,
    `起初，几乎所有人都以为事情很简单。可很快，他们发现很多词背后的关系比预想更复杂。`,
    `他们没有急着向前冲，而是停下来整理记录、比较访谈，想弄清线索背后的结构。`,
    `这种缓慢的方法非常重要，因为真正的实践并不依赖某个戏剧性瞬间，而依赖团队是否愿意长期返回问题本身。`,
    `随着讨论继续，有人盯着公共层面的细节，有人则更注意隐藏在日常压力里的情绪与判断。`,
    `证据越积越多，小组越清楚地看到：地方性的决定并不是由单一原因决定的。`,
    `正因为如此，他们不愿把这件事当成一场短暂展示，而希望它在活动结束后仍然有价值。`,
    `现场复查再次改变了方案，因为真实空间总会通过一些很小的迹象说话。`,
    `这时，成员们终于明白，合作不仅是分工，更是学会把不同问题放进同一个视野里。`,
    `最有效的讨论常常发生在深夜，当人们不再死守最初观点，而愿意重新比较证据的时候。`,
    `这些交换让他们看见，公共工作之所以有深度，恰恰因为观察、记忆与修正会不断流动。`,
    `最终，小组之所以能拿出更强的方案，并不是因为冲突完全消失，而是因为他们学会把分歧变成测试。`,
    `最后的版本表面平静，却包含了数周看不见的劳动。`,
    `真正打动评审的，不只是外观，而是小组在每次想要走捷径时都愿意回到问题中心。`,
    `这种坚持让整个作品获得了不同的气质，也说明集体学习可以在耐心中长出来。`,
    `等灯全部熄灭时，连最后两张词卡也不再像孤立词汇，而像共同注意力留下的证据。`
  ];
  return en.map((text, index) => ({ en: text, zh: zh[index] }));
}

function buildGeneratedStory(group) {
  const storyIndex = Number(group.storyNo) - 1;
  const themeInfo = themePool[storyIndex % themePool.length];
  return {
    title: `Story ${group.storyNo} · ${themeInfo.title}`,
    subtitle: `按固定词库顺序生成的第 ${group.storyNo} 篇：中文故事记词 + 独立阅读理解`,
    theme: themeInfo.theme,
    readingNote: "这篇内容由本地词库目录自动生成，保持与本篇 50 词完全对齐，适合继续迭代人工润色。",
    vocabStory: buildChineseStory(group, themeInfo),
    reading: {
      passage: buildReadingPassage(group, themeInfo),
      questions: questionSet
    }
  };
}

const result = {};
for (const group of catalog.groups) {
  result[group.id] = existing[group.id] || buildGeneratedStory(group);
}

const storyPayload = `window.STORY_CONTENT = ${JSON.stringify(result, null, 2)};\n`;
fs.writeFileSync(outputStoriesPath, storyPayload, "utf8");

const archivePayload = {
  project_name: "考研英语二词汇故事站",
  source_of_truth: "generated_vocab_index.json",
  stories: catalog.groups.map((group) => ({
    story_id: group.id,
    title: result[group.id].title.replace(/^Story\s+\d+\s+·\s+/, ""),
    vocab_range: group.range,
    word_count: group.count,
    created_status: "completed_priority_content_v1"
  })),
  next_story: {
    story_id: null,
    expected_range: null
  }
};
fs.writeFileSync(archivePath, `${JSON.stringify(archivePayload, null, 2)}\n`, "utf8");

console.log(`Generated complete story content for ${catalog.groups.length} stories.`);
