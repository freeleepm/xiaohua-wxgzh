import { parseMarkdownToHTML } from "@/lib/markdown-parser"
import {
  parseHtmlToWechat,
  type HtmlStylePolicy,
} from "@/lib/html-to-wechat"
import { DEFAULT_THEME_ID, type ThemeId } from "@/lib/wechat-themes"

export type SourceMode = "markdown" | "html"

export const SOURCE_MODE_KEY = "md2wx-source-mode"

export const isSourceMode = (v: string): v is SourceMode =>
  v === "markdown" || v === "html"

export type { HtmlStylePolicy }

/** 统一出口：Markdown / HTML → 微信可粘贴 HTML */
export function renderSourceToWechat(
  source: string,
  mode: SourceMode,
  themeId: ThemeId = DEFAULT_THEME_ID,
  htmlStylePolicy: HtmlStylePolicy = "preserve",
): string {
  if (!source.trim()) return ""
  if (mode === "html") return parseHtmlToWechat(source, themeId, htmlStylePolicy)
  return parseMarkdownToHTML(source, themeId)
}
