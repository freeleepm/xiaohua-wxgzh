import { parseMarkdownToHTML } from "@/lib/markdown-parser"
import { parseHtmlToWechat } from "@/lib/html-to-wechat"
import { DEFAULT_THEME_ID, type ThemeId } from "@/lib/wechat-themes"

export type SourceMode = "markdown" | "html"

export const SOURCE_MODE_KEY = "md2wx-source-mode"

export const isSourceMode = (v: string): v is SourceMode =>
  v === "markdown" || v === "html"

/**
 * Markdown：按站点主题渲染
 * HTML：只保留原文自定义样式，并做微信兼容（不套用站点主题）
 */
export function renderSourceToWechat(
  source: string,
  mode: SourceMode,
  themeId: ThemeId = DEFAULT_THEME_ID,
): string {
  if (!source.trim()) return ""
  if (mode === "html") return parseHtmlToWechat(source)
  return parseMarkdownToHTML(source, themeId)
}
