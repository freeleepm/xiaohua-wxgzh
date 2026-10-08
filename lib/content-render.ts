import { parseMarkdownToHTML } from "@/lib/markdown-parser"
import { parseHtmlToWechat } from "@/lib/html-to-wechat"
import { normalizeWechatArticleHtml } from "@/lib/wechat-article-normalize"
import { DEFAULT_THEME_ID, type ThemeId } from "@/lib/wechat-themes"

export type SourceMode = "markdown" | "html"

export const SOURCE_MODE_KEY = "md2wx-source-mode"

export const isSourceMode = (v: string): v is SourceMode =>
  v === "markdown" || v === "html"

/**
 * Markdown：站点主题渲染
 * HTML：保留自定义样式 + 微信兼容
 * 最后统一：公众号结构规范化（对齐 / 宽度 / 行高 …）
 */
export function renderSourceToWechat(
  source: string,
  mode: SourceMode,
  themeId: ThemeId = DEFAULT_THEME_ID,
): string {
  if (!source.trim()) return ""
  const raw =
    mode === "html"
      ? parseHtmlToWechat(source)
      : parseMarkdownToHTML(source, themeId)

  // 浏览器端才能做 DOM 规范化；SSR 原样返回
  if (typeof window === "undefined") return raw
  return normalizeWechatArticleHtml(raw)
}
