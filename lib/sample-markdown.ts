export const SAMPLE_MARKDOWN = `# 小华同学 AI 公众号排版工具

**学天科技**旗下公众号工具示例：左侧用 Markdown 写作，右侧实时预览微信图文效果，点击「复制到公众号」即可粘贴进微信公众平台。

## 适用场景

适合日常公众号写稿——先把结构与内容写清楚，再一键套用专业主题，减少在微信后台手工调样式的时间。

### 推荐用法

- 先用三级标题搭好结构，再填充细节
- 关键句用**加粗**，金句或提醒放在引用块
- 代码、表格、图片优先用顶部工具栏插入
- 写完可切换主题对比版式，确认后再复制

### 一段常用的开场

\`\`\`javascript
// 小华同学 AI：Markdown → 微信 HTML
const html = parseMarkdownToHTML(draft)
// 然后「复制到公众号」，样式跟着走
\`\`\`

> 小华同学的习惯：写完先预览一遍手机宽度，再复制。微信会剥 flex、会剥 div 背景，这个工具已经按公众号能留下的标签来排。

## 和后台手调对比

| 环节 | 微信后台 | 本工具 |
|------|----------|--------|
| 写稿 | 鼠标点格式 | Markdown + 工具栏 |
| 预览 | 保存后才看 | 边写边看 |
| 主题 | 每次重调 | 一键切换 |
| 贴进去 | 容易丢样式 | 内联样式，带得走 |

---

写完后切换主题确认版式，再复制到公众号发布即可。
`

/** HTML 源码示例：自带 CSS 主题（HTML 模式不套用站点主题） */
export const SAMPLE_HTML = `<style>
  .xt-wrap { color: #1f2937; font-size: 15px; line-height: 1.8; }
  .xt-title {
    margin: 0 0 20px;
    padding: 16px 18px;
    background: linear-gradient(135deg, #0f766e, #14b8a6);
    color: #fff;
    font-size: 22px;
    font-weight: 700;
    border-radius: 10px;
  }
  .xt-h2 {
    margin: 28px 0 12px;
    padding-left: 12px;
    border-left: 4px solid #0d9488;
    font-size: 18px;
    color: #0f766e;
  }
  .xt-p { margin: 0 0 14px; color: #374151; }
  .xt-quote {
    margin: 16px 0;
    padding: 12px 16px;
    background: #f0fdfa;
    border-left: 3px solid #14b8a6;
    color: #115e59;
  }
  .xt-list { margin: 8px 0 16px 1.2em; color: #374151; }
  .xt-list li { margin: 6px 0; }
  .xt-em { color: #0d9488; font-weight: 600; }
</style>
<section class="xt-wrap">
  <h1 class="xt-title">小华同学 AI · HTML 自定义主题示例</h1>
  <p class="xt-p"><strong>学天科技</strong>旗下工具：粘贴<strong class="xt-em">已带样式</strong>的 HTML，保留原文主题，转换为微信可粘贴结构。</p>
  <h2 class="xt-h2">适用场景</h2>
  <ul class="xt-list">
    <li>博客 / 文档导出的带 CSS 主题 HTML</li>
    <li>运营已定稿的富文本，需要原样进公众号</li>
    <li>与 Markdown 模式分开：站点主题只给 Markdown 用</li>
  </ul>
  <blockquote class="xt-quote">流程：HTML 模式 → 粘贴源码 → 预览 → 复制到公众号。</blockquote>
  <h2 class="xt-h2">推荐流程</h2>
  <ol class="xt-list">
    <li>切换到 HTML 模式</li>
    <li>粘贴含 &lt;style&gt; 或内联 style 的源码</li>
    <li>预览确认后复制发布</li>
  </ol>
</section>
`