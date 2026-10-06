/**
 * Markdown 编辑动作 + 插入片段构建
 *
 * 工具分两类：
 * - action：点一下直接改（标题 / 粗体 / 列表…）
 * - dialog：先填表单再插入（链接 / 图片 / 表格 / 代码块）
 */

export type MdAction =
  | { type: "wrap"; before: string; after: string; empty: string }
  | { type: "prefix"; prefix: string }
  | { type: "heading"; level: 1 | 2 | 3 | 4 }
  | { type: "insert"; snippet: string; cursor?: number; selectLen?: number }

export type MdEditResult = {
  value: string
  selectionStart: number
  selectionEnd: number
}

export type InsertDialogKind = "link" | "image" | "code" | "table"

const lineBounds = (value: string, start: number, end: number) => {
  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1
  let lineEnd = value.indexOf("\n", end)
  if (lineEnd === -1) lineEnd = value.length
  return { lineStart, lineEnd }
}

const isWs = (ch: string | undefined) =>
  ch === " " || ch === "\t" || ch === "\n" || ch === "\r"

/** 去掉选区两端空白/换行，避免 **文字\\n** 这种跨行标记 */
const shrinkSelection = (value: string, start: number, end: number) => {
  let from = Math.min(start, end)
  let to = Math.max(start, end)
  while (from < to && isWs(value[from])) from++
  while (to > from && isWs(value[to - 1])) to--
  return { from, to }
}

const wrapLineContent = (line: string, before: string, after: string) => {
  const match = /^([ \t]*)(.*?)([ \t]*)$/.exec(line)
  if (!match) return line
  const [, indent, content, tail] = match
  if (!content) return line
  if (
    content.startsWith(before) &&
    content.endsWith(after) &&
    content.length >= before.length + after.length
  ) {
    return indent + content.slice(before.length, content.length - after.length) + tail
  }
  return indent + before + content + after + tail
}

const wrap = (
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  empty: string,
): MdEditResult => {
  const { from, to } = shrinkSelection(value, start, end)
  const inner = value.slice(from, to)

  if (!inner) {
    const insert = before + empty + after
    const next = value.slice(0, from) + insert + value.slice(to)
    const selStart = from + before.length
    return {
      value: next,
      selectionStart: selStart,
      selectionEnd: selStart + empty.length,
    }
  }

  // 跨行时逐行加标记：解析器行内语法不吃换行
  const wrapped = inner.includes("\n")
    ? inner
        .split("\n")
        .map((line) => wrapLineContent(line, before, after))
        .join("\n")
    : wrapLineContent(inner, before, after)

  const next = value.slice(0, from) + wrapped + value.slice(to)
  return {
    value: next,
    selectionStart: from,
    selectionEnd: from + wrapped.length,
  }
}

const prefixLines = (
  value: string,
  start: number,
  end: number,
  prefix: string,
): MdEditResult => {
  const shrunk = shrinkSelection(value, start, end)
  const from = shrunk.from < shrunk.to ? shrunk.from : Math.min(start, end)
  const to = shrunk.from < shrunk.to ? shrunk.to : from
  const { lineStart, lineEnd } = lineBounds(value, from, to)
  const block = value.slice(lineStart, lineEnd)
  const lines = block.split("\n")
  const nextBlock = lines
    .map((line) => {
      if (!line.trim()) return line
      if (line.startsWith(prefix)) return line
      return prefix + line
    })
    .join("\n")
  const next = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd)
  return {
    value: next,
    selectionStart: lineStart,
    selectionEnd: lineStart + nextBlock.length,
  }
}

const applyHeading = (
  value: string,
  start: number,
  end: number,
  level: 1 | 2 | 3 | 4,
): MdEditResult => {
  const shrunk = shrinkSelection(value, start, end)
  const from = shrunk.from < shrunk.to ? shrunk.from : Math.min(start, end)
  const { lineStart, lineEnd } = lineBounds(value, from, from)
  const line = value.slice(lineStart, lineEnd)
  const stripped = line.replace(/^#{1,6}\s+/, "")
  const hashes = "#".repeat(level)
  const nextLine = `${hashes} ${stripped || "标题"}`
  const next = value.slice(0, lineStart) + nextLine + value.slice(lineEnd)
  const contentStart = lineStart + hashes.length + 1
  return {
    value: next,
    selectionStart: contentStart,
    selectionEnd: contentStart + (stripped || "标题").length,
  }
}

const insertSnippet = (
  value: string,
  start: number,
  end: number,
  snippet: string,
  cursor?: number,
  selectLen?: number,
): MdEditResult => {
  const next = value.slice(0, start) + snippet + value.slice(end)
  const pos = start + (cursor ?? snippet.length)
  return {
    value: next,
    selectionStart: pos,
    selectionEnd: pos + (selectLen ?? 0),
  }
}

export const applyMdAction = (
  value: string,
  start: number,
  end: number,
  action: MdAction,
): MdEditResult => {
  switch (action.type) {
    case "wrap":
      return wrap(value, start, end, action.before, action.after, action.empty)
    case "prefix":
      return prefixLines(value, start, end, action.prefix)
    case "heading":
      return applyHeading(value, start, end, action.level)
    case "insert":
      return insertSnippet(
        value,
        start,
        end,
        action.snippet,
        action.cursor,
        action.selectLen,
      )
  }
}

/** 在光标处插入整段 snippet，光标落到末尾 */
export const insertAtCursor = (
  value: string,
  start: number,
  end: number,
  snippet: string,
): MdEditResult => insertSnippet(value, start, end, snippet)

// ── 弹窗表单 → Markdown 片段 ────────────────────────────────────

export const buildLinkMd = (text: string, url: string) => {
  const t = text.trim() || "链接文字"
  const u = url.trim() || "https://"
  return `[${t}](${u})`
}

export const buildImageMd = (alt: string, url: string) => {
  const a = alt.trim() || "图片描述"
  const u = url.trim() || "https://"
  return `![${a}](${u})`
}

export const buildCodeBlockMd = (lang: string, code: string) => {
  const l = lang.trim() || "javascript"
  const body = code.replace(/^\n+|\n+$/g, "")
  return `\n\`\`\`${l}\n${body}\n\`\`\`\n`
}

export const buildTableMd = (headerText: string, rowCount: number) => {
  const headers = headerText
    .split(/[,，|]/)
    .map((s) => s.trim())
    .filter(Boolean)
  const cols = headers.length > 0 ? headers : ["列1", "列2", "列3"]
  const rows = Math.min(20, Math.max(1, Math.floor(rowCount) || 1))
  const head = `| ${cols.join(" | ")} |`
  const sep = `| ${cols.map(() => "---").join(" | ")} |`
  const body = Array.from({ length: rows }, () =>
    `| ${cols.map(() => "内容").join(" | ")} |`,
  ).join("\n")
  return `\n${head}\n${sep}\n${body}\n`
}

export const CODE_LANG_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "plain", label: "纯文本" },
] as const

// ── 工具目录 ────────────────────────────────────────────────────

export type MdToolDef = {
  id: string
  label: string
  tip: string
  group: "history" | "heading" | "inline" | "block" | "insert"
  kind: "action" | "dialog"
  action?: MdAction
  dialog?: InsertDialogKind
}

export const MD_TOOL_DEFS: MdToolDef[] = [
  {
    id: "h1",
    label: "一级标题",
    tip: "设为一级标题",
    group: "heading",
    kind: "action",
    action: { type: "heading", level: 1 },
  },
  {
    id: "h2",
    label: "二级标题",
    tip: "设为二级标题",
    group: "heading",
    kind: "action",
    action: { type: "heading", level: 2 },
  },
  {
    id: "h3",
    label: "三级标题",
    tip: "设为三级标题",
    group: "heading",
    kind: "action",
    action: { type: "heading", level: 3 },
  },
  {
    id: "bold",
    label: "粗体",
    tip: "加粗文字",
    group: "inline",
    kind: "action",
    action: { type: "wrap", before: "**", after: "**", empty: "加粗文字" },
  },
  {
    id: "italic",
    label: "斜体",
    tip: "斜体文字",
    group: "inline",
    kind: "action",
    action: { type: "wrap", before: "*", after: "*", empty: "斜体文字" },
  },
  {
    id: "strike",
    label: "删除线",
    tip: "删除线",
    group: "inline",
    kind: "action",
    action: { type: "wrap", before: "~~", after: "~~", empty: "删除文字" },
  },
  {
    id: "code",
    label: "行内代码",
    tip: "行内代码",
    group: "inline",
    kind: "action",
    action: { type: "wrap", before: "`", after: "`", empty: "code" },
  },
  {
    id: "quote",
    label: "引用",
    tip: "引用块",
    group: "block",
    kind: "action",
    action: { type: "prefix", prefix: "> " },
  },
  {
    id: "ul",
    label: "列表",
    tip: "无序列表",
    group: "block",
    kind: "action",
    action: { type: "prefix", prefix: "- " },
  },
  {
    id: "ol",
    label: "序号",
    tip: "有序列表",
    group: "block",
    kind: "action",
    action: { type: "prefix", prefix: "1. " },
  },
  {
    id: "hr",
    label: "分割线",
    tip: "插入分割线",
    group: "block",
    kind: "action",
    action: { type: "insert", snippet: "\n\n---\n\n" },
  },
  {
    id: "link",
    label: "链接",
    tip: "插入链接",
    group: "insert",
    kind: "dialog",
    dialog: "link",
  },
  {
    id: "image",
    label: "图片",
    tip: "插入图片",
    group: "insert",
    kind: "dialog",
    dialog: "image",
  },
  {
    id: "fence",
    label: "代码块",
    tip: "插入代码块",
    group: "insert",
    kind: "dialog",
    dialog: "code",
  },
  {
    id: "table",
    label: "表格",
    tip: "插入表格",
    group: "insert",
    kind: "dialog",
    dialog: "table",
  },
]
