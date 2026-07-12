# Project Status

## 当前完成

- 已建立本地静态网站，可直接打开 `index.html`
- 已重构为双区结构：
  - 词汇学习区：中文故事 + 英文词汇高亮 + 词后释义开关
  - 阅读理解区：独立文章 + 句对句中文 + 5 道选择题 + 解析
- 已完成全部 114 篇正文与阅读题生成
- 已支持统一单词高亮、中文开关、自动判分、答案解析、目录分页
- 已建立本地固定词库文件 `vocabulary_index.js`
- 已建立本地篇目归档文件 `story_archive.json`
- 已保存原始总词表 `source/kaoyan_2025_5500_source.txt`
- 已建立重点词前置名单 `priority_words.txt`
- 已建立重点词自动生成脚本 `build_priority_words.js`
- 已生成重点词说明文件 `priority_words_meta.json`
- 已建立自动重排脚本 `build_vocab_index.js`
- 已生成 `2042` 个实词优先 priority 重点词
- 已生成完整顺序表 `generated_vocab_index.json`
- 已完成全量目录分页与单篇打开模式

## 当前覆盖

- Story 001-114
- 词汇编号：0001-5681

## 下一任务

- 如需继续优化，可逐篇人工润色自动生成的正文
- 可继续补充 PDF 导出方案
- 可继续增加搜索、收藏、错题本功能

## 维护规则

- 每篇短文统一写入 `stories.js`
- 主词表统一维护在 `vocabulary_index.js`
- 篇目占用区间统一归档在 `story_archive.json`
- 每篇必须包含：
  - `vocabulary`
  - `vocabStory`
  - `reading`
- `vocabStory` 必须包含英文短文与中文对照
- `reading` 必须包含独立阅读短文、中文对照、5 道选择题
- 新故事只能按主词表顺序取下一个未使用的 50 词区间
- 禁止跳号、重复取词、临时改词
- `questions` 固定 5 题，优先覆盖：
  - 细节理解
  - 推断判断
  - 词义猜测
  - 主旨概括
  - 写作目的 / 观点态度
