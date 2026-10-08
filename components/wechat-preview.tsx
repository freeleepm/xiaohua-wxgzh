"use client"

import { useMemo } from "react"
import { renderSourceToWechat, type SourceMode } from "@/lib/content-render"
import { DEFAULT_THEME_ID, getTheme, type ThemeId } from "@/lib/wechat-themes"

interface WechatPreviewProps {
  source: string
  mode?: SourceMode
  themeId?: ThemeId
}

export function WechatPreview({
  source,
  mode = "markdown",
  themeId = DEFAULT_THEME_ID,
}: WechatPreviewProps) {
  const theme = getTheme(themeId)
  const html = useMemo(
    () => renderSourceToWechat(source, mode, themeId),
    [source, mode, themeId],
  )

  if (!source.trim()) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-4 text-center px-10"
        style={{ background: "var(--tool-preview-bg)", minHeight: 300 }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "var(--brand-light)" }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div>
          <p
            className="text-sm font-semibold mb-1.5"
            style={{ color: "var(--tool-editor-text)" }}
          >
            {mode === "html"
              ? "在左侧粘贴 HTML 源码"
              : "在左侧粘贴 Markdown 内容"}
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--tool-label-text)" }}
          >
            右侧将实时预览微信公众号排版效果，可一键复制发布
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="wechat-preview-container"
      style={{
        padding: "32px 36px 56px",
        fontFamily: theme.font,
        background: "var(--tool-preview-bg)",
        minHeight: "100%",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
