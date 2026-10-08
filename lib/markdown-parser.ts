/**
 * Lightweight Markdown → WeChat-compatible HTML parser
 * All styles are inline for maximum compatibility with WeChat editor
 * 作者：小华同学 AI
 *
 * 解析顺序不要改；外观全部走 wechat-render + 当前主题。
 */

import { DEFAULT_THEME_ID, getTheme, type ThemeId } from "./wechat-themes"
import {
  renderEm,
  renderH1,
  renderH2,
  renderH3,
  renderH4,
  renderH5,
  renderH6,
  renderHr,
  renderImage,
  renderInlineCode,
  renderLink,
  renderOlItem,
  renderParagraph,
  renderQuote,
  renderStrike,
  renderStrong,
  renderTable,
  renderUlItem,
  wrapList,
} from "./wechat-render"

// ── 语法高亮（highlight.js + One Dark 内联样式）────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-require-imports
const hljs = require("./highlight.min.js")

// One Dark 主题颜色映射：hljs CSS 类名 → 内联颜色
const HLJS_COLORS: Record<string, string> = {
  "hljs-keyword":        "#c678dd",
  "hljs-built_in":       "#e06c75",
  "hljs-type":           "#e5c07b",
  "hljs-literal":        "#56b6c2",
  "hljs-number":         "#d19a66",
  "hljs-operator":       "#56b6c2",
  "hljs-punctuation":    "#abb2bf",
  "hljs-property":       "#e06c75",
  "hljs-regexp":         "#98c379",
  "hljs-string":         "#98c379",
  "hljs-char.escape_":   "#98c379",
  "hljs-subst":          "#abb2bf",
  "hljs-symbol":         "#61afef",
  "hljs-class":          "#e5c07b",
  "hljs-function":       "#61afef",
  "hljs-title":          "#61afef",
  "hljs-title.class_":   "#e5c07b",
  "hljs-title.function_":"#61afef",
  "hljs-params":         "#abb2bf",
  "hljs-comment":        "#5c6370",
  "hljs-doctag":         "#c678dd",
  "hljs-meta":           "#e06c75",
  "hljs-meta-keyword":   "#c678dd",
  "hljs-meta-string":    "#98c379",
  "hljs-section":        "#61afef",
  "hljs-tag":            "#e06c75",
  "hljs-name":           "#e06c75",
  "hljs-attr":           "#d19a66",
  "hljs-attribute":      "#d19a66",
  "hljs-variable":       "#e06c75",
  "hljs-variable.language_": "#56b6c2",
  "hljs-bullet":         "#61afef",
  "hljs-code":           "#98c379",
  "hljs-emphasis":       "#e06c75",
  "hljs-strong":         "#e5c07b",
  "hljs-formula":        "#56b6c2",
  "hljs-link":           "#56b6c2",
  "hljs-quote":          "#5c6370",
  "hljs-selector-tag":   "#e06c75",
  "hljs-selector-id":    "#61afef",
  "hljs-selector-class": "#d19a66",
  "hljs-selector-attr":  "#56b6c2",
  "hljs-selector-pseudo":"#56b6c2",
  "hljs-template-tag":   "#c678dd",
  "hljs-template-variable":"#e06c75",
  "hljs-addition":       "#98c379",
  "hljs-deletion":       "#e06c75",
}

/**
 * 将 highlight.js 输出的 class 属性转换为内联 style（微信兼容）
 * 例: <span class="hljs-keyword">  →  <span style="color:#c678dd">
 */
function classesToInlineStyles(html: string): string {
  // 处理带多个 class 的 span，取第一个匹配到的颜色
  return html.replace(
    /<span class="([^"]+)">|<span>/g,
    (match, classAttr?: string) => {
      if (!classAttr) return '<span>'
      // classAttr 可能是 "hljs-keyword" 或 "hljs-title function_" 等
      const classes = classAttr.trim().split(/\s+/)
      // 找到第一个有颜色映射的 class
      for (const cls of classes) {
        const color = HLJS_COLORS[cls]
        if (color) return `<span style="color:${color}">`
      }
      // 没有匹配的颜色，使用默认文本色
      return '<span style="color:#abb2bf">'
    }
  )
}

function highlightCode(code: string, lang: string): string {
  const l = lang.toLowerCase()

  // 尝试用 highlight.js 进行语法高亮
  try {
    // 语言别名映射
    const langAlias: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      sh: "bash",
      shell: "bash",
      yml: "yaml",
    }
    const normalizedLang = langAlias[l] || l

    let highlighted: string
    if (normalizedLang && normalizedLang !== "plain" && normalizedLang !== "text") {
      try {
        const result = hljs.highlight(code, { language: normalizedLang, ignoreIllegals: true })
        highlighted = result.value
      } catch {
        // 语言不支持时自动检测
        const result = hljs.highlightAuto(code)
        highlighted = result.value
      }
    } else {
      // plain/text：只做 HTML 转义
      highlighted = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    }

    // 将 class 属性转换为内联 style（微信兼容）
    return classesToInlineStyles(highlighted)
  } catch {
    // 兜底：纯 HTML 转义
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  }
}


export function parseMarkdownToHTML(md: string, themeId: ThemeId = DEFAULT_THEME_ID): string {
  if (!md.trim()) return ""

  const theme = getTheme(themeId)
  let html = md

  // ── 0. Extract code blocks into placeholders (prevents # etc. being parsed) ─
  const codeBlocks: string[] = []
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const highlighted = highlightCode(code.trim(), lang || "plain")

    // float 布局代替 flex；装饰圆点不写文字（官方对 line-height:0/偏小+有字会实测叠字）
    const langLabel = lang
      ? `<span style="float:right;font-size:11px;color:#8b8b9e;letter-spacing:0.1em;text-transform:uppercase;font-weight:500;line-height:1.6;">${lang}</span>`
      : `<span style="float:right;font-size:11px;color:#8b8b9e;line-height:1.6;">plaintext</span>`

    const trafficLights =
      `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#ff5f57;margin-right:6px;"></span>` +
      `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#febc2e;margin-right:6px;"></span>` +
      `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#28c840;"></span>`

    // 用 section 代替 div：微信粘贴时会剥除 div 的 background，但保留 section 的 background
    const blockHTML =
      `<section style="margin:24px 0;border-radius:10px;overflow:hidden;border:1px solid #2a2a2e;">` +
        `<section style="background:#1c1c1e;padding:10px 16px;border-bottom:1px solid #2a2a2e;overflow:hidden;line-height:1.6;">` +
          `<span style="float:left;height:12px;line-height:1.6;">${trafficLights}</span>` +
          langLabel +
        `</section>` +
        `<section style="background:#1a1a1a;margin:0;padding:20px 22px;overflow-x:auto;line-height:1.8;">` +
          `<span style="font-size:13px;line-height:1.8;color:#e2e8f0;white-space:pre-wrap;word-break:break-word;display:block;max-width:100%;box-sizing:border-box;font-family:Menlo,Consolas,SFMono-Regular,Courier New,monospace;">${highlighted}</span>` +
        `</section>` +
      `</section>`

    const idx = codeBlocks.length
    codeBlocks.push(blockHTML)
    return `\n%%CODEBLOCK_${idx}%%\n`
  })

  // ── 1. Inline code ─────────────────────────────────────────────────────────
  html = html.replace(/`([^`\n]+)`/g, (_, code) => {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    return renderInlineCode(escaped, theme)
  })

  // ── 2. Horizontal rules ─────────────────────────────────────────────────────
  html = html.replace(/^[ \t]*[-_*]{3,}[ \t]*$/gm, () => renderHr(theme))

  // ── 3. Blockquotes ─────────────────────────────────────────────────────────
  html = html.replace(/^>\s?(.+)$/gm, (_, content) => renderQuote(content, theme))

  // ── 4. Headings（H6 → H1，从长到短）────────────────────────────────────────
  html = html.replace(/^######\s+(.+)$/gm, (_, t) => renderH6(t, theme))
  html = html.replace(/^#####\s+(.+)$/gm, (_, t) => renderH5(t, theme))
  html = html.replace(/^####\s+(.+)$/gm, (_, t) => renderH4(t, theme))
  html = html.replace(/^###\s+(.+)$/gm, (_, t) => renderH3(t, theme))
  html = html.replace(/^##\s+(.+)$/gm, (_, t) => renderH2(t, theme))
  html = html.replace(/^#\s+(.+)$/gm, (_, t) => renderH1(t, theme))

  // ── 5. Bold + Italic（只匹配同一行，避免 **文字\\n** 失效）────────────────
  html = html.replace(/\*\*\*([^\n]+?)\*\*\*/g, (_, t) =>
    `<strong style="font-weight:800;">${renderEm(t, theme)}</strong>`,
  )
  html = html.replace(/\*\*([^\n]+?)\*\*/g, (_, t) => renderStrong(t, theme))
  html = html.replace(/__([^\n]+?)__/g, (_, t) => renderStrong(t, theme))
  html = html.replace(/\*([^\n]+?)\*/g, (_, t) => renderEm(t, theme))
  html = html.replace(/_([^\n]+?)_/g, (_, t) => renderEm(t, theme))

  // ── 6. Strikethrough ────────────────────────────────────────────────────────
  html = html.replace(/~~([^\n]+?)~~/g, (_, t) => renderStrike(t, theme))

  // ── 7. Images ───────────────────────────────────────────────────────────────
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => renderImage(alt, src))

  // ── 8. Links ────────────────────────────────────────────────────────────────
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => renderLink(text, href, theme))

  // ── 9. Unordered lists ──────────────────────────────────────────────────────
  html = html.replace(/((?:^[ \t]*[-*+][ \t].+(?:\n|$))+)/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line) => renderUlItem(line.replace(/^[ \t]*[-*+][ \t]/, ""), theme))
      .join("")
    return wrapList(items)
  })

  // ── 10. Ordered lists ───────────────────────────────────────────────────────
  html = html.replace(/((?:^[ \t]*\d+\.[ \t].+(?:\n|$))+)/gm, (block) => {
    let counter = 0
    const items = block
      .trim()
      .split("\n")
      .map((line) => {
        counter++
        return renderOlItem(line.replace(/^[ \t]*\d+\.[ \t]/, ""), counter, theme)
      })
      .join("")
    return wrapList(items)
  })

  // ── 11. Tables ──────────────────────────────────────────────────────────────
  html = html.replace(/((?:^\|.+\|[ \t]*(?:\n|$))+)/gm, (block) => {
    const rows = block
      .trim()
      .split("\n")
      .filter((r) => !/^\|[-|: ]+\|$/.test(r.trim()))
    if (rows.length < 1) return block

    const parseCells = (row: string) =>
      row.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1)

    return renderTable(
      parseCells(rows[0]).map((cell) => cell.trim()),
      rows.slice(1).map((row) => parseCells(row).map((cell) => cell.trim())),
      theme,
    )
  })

  // ── 12. Paragraphs ──────────────────────────────────────────────────────────
  const blockTags = /^(<(section|div|table|pre|blockquote|hr|img|p|h[1-6])|%%CODEBLOCK)/
  const lines = html.split("\n")
  const result: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (blockTags.test(trimmed)) {
      result.push(trimmed)
    } else {
      result.push(renderParagraph(trimmed, theme))
    }
  }

  let finalHTML = result.join("\n")

  // ── 13. Re-insert code blocks ────────────────────────────────────────────────
  finalHTML = finalHTML.replace(/%%CODEBLOCK_(\d+)%%/g, (_, i) => codeBlocks[parseInt(i)])

  return finalHTML
}
