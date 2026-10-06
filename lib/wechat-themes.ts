/**
 * 公众号主题目录
 *
 * 每套主题必须自带「版式 kind」，不能只换色。
 * xiaohua 的 kind 保持原样，作为默认。
 */

const SANS = "-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif"
const SERIF = "Georgia,'Songti SC','Noto Serif SC','STSong','SimSun',serif"

export const DEFAULT_THEME_ID = "xiaohua"

export type ThemeId =
  | "xiaohua"
  | "ink"
  | "emerald"
  | "navy"
  | "rose"
  | "serif"
  | "frost"

export type WechatTheme = {
  id: ThemeId
  name: string
  desc: string
  swatch: string
  font: string
  headingFont: string
  h1: {
    kind: "band" | "split-bar" | "flag" | "ruled" | "blossom" | "serif-center" | "bar"
    bg: string
    color: string
    accent: string
    kicker: string
  }
  h2: {
    kind: "center-line" | "bar" | "index" | "ruled" | "ornament" | "dash" | "plain"
    color: string
    accent: string
  }
  h3: {
    kind: "pill" | "dot" | "tag" | "kicker" | "italic" | "plain" | "hash"
    color: string
    bg: string
  }
  h4: string
  h5: string
  h6: string
  body: {
    size: string
    line: string
    indent: string
    align: "left" | "justify"
  }
  text: string
  bold: string
  italic: string
  strike: string
  link: string
  linkBorder: string
  quote: {
    kind: "card" | "mark" | "bar" | "panel"
    bg: string
    border: string
    color: string
    mark: string
  }
  list: { kind: "dot" | "square" | "diamond" | "dash" | "emdash" }
  bullet: string
  ol: { kind: "badge" | "square" | "index" | "plain"; bg: string; color: string }
  table: {
    kind: "solid" | "line" | "minimal"
    headBg: string
    headColor: string
    border: string
    cell: string
    stripe: string
  }
  inlineCode: { bg: string; color: string; border: string }
  hr: { kind: "fade" | "ornament" | "short" | "double"; color: string }
}

export const WECHAT_THEMES: WechatTheme[] = [
  {
    id: "xiaohua",
    name: "小华橙",
    desc: "暖橙标题带 · 日常推文",
    swatch: "#E85D04",
    font: SANS,
    headingFont: SANS,
    h1: {
      kind: "band",
      bg: "linear-gradient(135deg,#EA580C 0%,#F97316 100%)",
      color: "#fff",
      accent: "#E85D04",
      kicker: "",
    },
    h2: { kind: "center-line", color: "#18181b", accent: "#E85D04" },
    h3: { kind: "pill", color: "#C2410C", bg: "linear-gradient(to right,#FFF1E9,#FFFBF7)" },
    h4: "#52525b",
    h5: "#71717a",
    h6: "#a1a1aa",
    body: { size: "15px", line: "1.9", indent: "0", align: "left" },
    text: "#3f3f46",
    bold: "#09090b",
    italic: "#52525b",
    strike: "#a1a1aa",
    link: "#E85D04",
    linkBorder: "rgba(232,93,4,0.35)",
    quote: { kind: "card", bg: "#fffbf5", border: "#fed7aa", color: "#92400e", mark: "#E85D04" },
    list: { kind: "dot" },
    bullet: "#E85D04",
    ol: { kind: "badge", bg: "#E85D04", color: "#fff" },
    table: {
      kind: "solid",
      headBg: "#E85D04",
      headColor: "#fff",
      border: "#f0f0f2",
      cell: "#3f3f46",
      stripe: "",
    },
    inlineCode: { bg: "#f1f5f9", color: "#0f172a", border: "#e2e8f0" },
    hr: { kind: "fade", color: "#d1d5db" },
  },
  {
    id: "ink",
    name: "墨金",
    desc: "封面金线 · 专栏深度",
    swatch: "#C9A227",
    font: SANS,
    headingFont: SANS,
    h1: { kind: "split-bar", bg: "#171717", color: "#fff", accent: "#C9A227", kicker: "FEATURE" },
    h2: { kind: "bar", color: "#171717", accent: "#C9A227" },
    h3: { kind: "dot", color: "#171717", bg: "#C9A227" },
    h4: "#3f3f46",
    h5: "#71717a",
    h6: "#a1a1aa",
    body: { size: "15px", line: "1.95", indent: "0", align: "left" },
    text: "#3f3f46",
    bold: "#171717",
    italic: "#52525b",
    strike: "#a1a1aa",
    link: "#A16207",
    linkBorder: "rgba(201,162,39,0.45)",
    quote: { kind: "panel", bg: "#171717", border: "#C9A227", color: "#F5F5F4", mark: "#C9A227" },
    list: { kind: "square" },
    bullet: "#C9A227",
    ol: { kind: "square", bg: "#171717", color: "#C9A227" },
    table: {
      kind: "solid",
      headBg: "#171717",
      headColor: "#C9A227",
      border: "#e7e5e4",
      cell: "#3f3f46",
      stripe: "#fafaf9",
    },
    inlineCode: { bg: "#f5f5f4", color: "#171717", border: "#e7e5e4" },
    hr: { kind: "ornament", color: "#C9A227" },
  },
  {
    id: "emerald",
    name: "青竹",
    desc: "章节旗标 · 教程科普",
    swatch: "#0F766E",
    font: SANS,
    headingFont: SANS,
    h1: {
      kind: "flag",
      bg: "#F0FDFA",
      color: "#134E4A",
      accent: "#0F766E",
      kicker: "GUIDE",
    },
    h2: { kind: "index", color: "#134E4A", accent: "#14B8A6" },
    h3: { kind: "tag", color: "#0F766E", bg: "#CCFBF1" },
    h4: "#3F6560",
    h5: "#5B7C78",
    h6: "#8AA6A2",
    body: { size: "15px", line: "1.85", indent: "0", align: "left" },
    text: "#3F4A48",
    bold: "#134E4A",
    italic: "#4B635F",
    strike: "#94A3B8",
    link: "#0F766E",
    linkBorder: "rgba(15,118,110,0.35)",
    quote: { kind: "card", bg: "#F0FDFA", border: "#99F6E4", color: "#115E59", mark: "#0D9488" },
    list: { kind: "dash" },
    bullet: "#0D9488",
    ol: { kind: "index", bg: "#0F766E", color: "#0F766E" },
    table: {
      kind: "line",
      headBg: "#F0FDFA",
      headColor: "#134E4A",
      border: "#99F6E4",
      cell: "#3F4A48",
      stripe: "",
    },
    inlineCode: { bg: "#F0FDFA", color: "#134E4A", border: "#99F6E4" },
    hr: { kind: "short", color: "#5EEAD4" },
  },
  {
    id: "navy",
    name: "苍青",
    desc: "下划线标题 · 行业观察",
    swatch: "#1E3A5F",
    font: SANS,
    headingFont: SANS,
    h1: { kind: "ruled", bg: "transparent", color: "#0F172A", accent: "#1E3A5F", kicker: "BRIEFING" },
    h2: { kind: "ruled", color: "#1E293B", accent: "#2563EB" },
    h3: { kind: "kicker", color: "#1E3A5F", bg: "#DBEAFE" },
    h4: "#334155",
    h5: "#64748B",
    h6: "#94A3B8",
    body: { size: "15px", line: "1.88", indent: "0", align: "left" },
    text: "#334155",
    bold: "#0F172A",
    italic: "#475569",
    strike: "#94A3B8",
    link: "#1D4ED8",
    linkBorder: "rgba(37,99,235,0.35)",
    quote: { kind: "bar", bg: "#F8FAFC", border: "#1E3A5F", color: "#1E3A5F", mark: "#2563EB" },
    list: { kind: "square" },
    bullet: "#1E3A5F",
    ol: { kind: "badge", bg: "#1E3A5F", color: "#fff" },
    table: {
      kind: "solid",
      headBg: "#1E3A5F",
      headColor: "#fff",
      border: "#E2E8F0",
      cell: "#334155",
      stripe: "#F8FAFC",
    },
    inlineCode: { bg: "#EFF6FF", color: "#1E3A5F", border: "#BFDBFE" },
    hr: { kind: "short", color: "#93C5FD" },
  },
  {
    id: "rose",
    name: "绛红",
    desc: "居中花饰 · 人物故事",
    swatch: "#9F1239",
    font: SANS,
    headingFont: SANS,
    h1: { kind: "blossom", bg: "#FFF1F2", color: "#881337", accent: "#E11D48", kicker: "" },
    h2: { kind: "ornament", color: "#881337", accent: "#E11D48" },
    h3: { kind: "italic", color: "#9F1239", bg: "" },
    h4: "#9F1239",
    h5: "#BE123C",
    h6: "#FDA4AF",
    body: { size: "15px", line: "2", indent: "0", align: "left" },
    text: "#44403C",
    bold: "#881337",
    italic: "#57534E",
    strike: "#A8A29E",
    link: "#BE123C",
    linkBorder: "rgba(190,18,60,0.35)",
    quote: { kind: "card", bg: "#FFF1F2", border: "#FECDD3", color: "#9F1239", mark: "#E11D48" },
    list: { kind: "diamond" },
    bullet: "#E11D48",
    ol: { kind: "badge", bg: "#9F1239", color: "#fff" },
    table: {
      kind: "solid",
      headBg: "#9F1239",
      headColor: "#fff",
      border: "#FECDD3",
      cell: "#44403C",
      stripe: "#FFF1F2",
    },
    inlineCode: { bg: "#FFF1F2", color: "#9F1239", border: "#FECDD3" },
    hr: { kind: "ornament", color: "#FDA4AF" },
  },
  {
    id: "serif",
    name: "书卷",
    desc: "衬线居中 · 文化随笔",
    swatch: "#44403C",
    font: SERIF,
    headingFont: SERIF,
    h1: { kind: "serif-center", bg: "transparent", color: "#1C1917", accent: "#A8A29E", kicker: "" },
    h2: { kind: "dash", color: "#292524", accent: "#A8A29E" },
    h3: { kind: "plain", color: "#44403C", bg: "" },
    h4: "#57534E",
    h5: "#78716C",
    h6: "#A8A29E",
    body: { size: "16px", line: "2.05", indent: "2em", align: "justify" },
    text: "#44403C",
    bold: "#1C1917",
    italic: "#57534E",
    strike: "#A8A29E",
    link: "#78716C",
    linkBorder: "rgba(120,113,108,0.45)",
    quote: { kind: "mark", bg: "transparent", border: "transparent", color: "#57534E", mark: "#A8A29E" },
    list: { kind: "emdash" },
    bullet: "#78716C",
    ol: { kind: "plain", bg: "#44403C", color: "#44403C" },
    table: {
      kind: "minimal",
      headBg: "transparent",
      headColor: "#1C1917",
      border: "#D6D3D1",
      cell: "#44403C",
      stripe: "",
    },
    inlineCode: { bg: "#F5F5F4", color: "#1C1917", border: "#E7E5E4" },
    hr: { kind: "double", color: "#D6D3D1" },
  },
  {
    id: "frost",
    name: "霜白",
    desc: "极简层级 · 产品公告",
    swatch: "#64748B",
    font: SANS,
    headingFont: SANS,
    h1: { kind: "bar", bg: "transparent", color: "#0F172A", accent: "#64748B", kicker: "" },
    h2: { kind: "plain", color: "#1E293B", accent: "#94A3B8" },
    h3: { kind: "hash", color: "#334155", bg: "" },
    h4: "#475569",
    h5: "#64748B",
    h6: "#94A3B8",
    body: { size: "15px", line: "1.8", indent: "0", align: "left" },
    text: "#334155",
    bold: "#0F172A",
    italic: "#475569",
    strike: "#94A3B8",
    link: "#475569",
    linkBorder: "rgba(100,116,139,0.4)",
    quote: { kind: "bar", bg: "#F8FAFC", border: "#CBD5E1", color: "#475569", mark: "#94A3B8" },
    list: { kind: "dash" },
    bullet: "#64748B",
    ol: { kind: "plain", bg: "#64748B", color: "#475569" },
    table: {
      kind: "minimal",
      headBg: "#F1F5F9",
      headColor: "#0F172A",
      border: "#E2E8F0",
      cell: "#334155",
      stripe: "",
    },
    inlineCode: { bg: "#F1F5F9", color: "#0F172A", border: "#E2E8F0" },
    hr: { kind: "short", color: "#E2E8F0" },
  },
]

const THEME_MAP = Object.fromEntries(WECHAT_THEMES.map((t) => [t.id, t])) as Record<
  ThemeId,
  WechatTheme
>

export function getTheme(id?: string): WechatTheme {
  if (id && id in THEME_MAP) return THEME_MAP[id as ThemeId]
  return THEME_MAP[DEFAULT_THEME_ID]
}

export function isThemeId(id: string): id is ThemeId {
  return id in THEME_MAP
}
