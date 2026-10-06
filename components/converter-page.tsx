"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { MarkdownEditor } from "@/components/markdown-editor"
import { WechatPreview } from "@/components/wechat-preview"
import { ThemePicker } from "@/components/theme-picker"
import { parseMarkdownToHTML } from "@/lib/markdown-parser"
import { SAMPLE_MARKDOWN } from "@/lib/sample-markdown"
import { loadCurrentDraft } from "@/lib/draft-versions"
import { useTextHistory } from "@/hooks/use-text-history"
import { useDraftVersions } from "@/hooks/use-draft-versions"
import { VersionPicker } from "@/components/version-picker"
import {
  DEFAULT_THEME_ID,
  getTheme,
  isThemeId,
  type ThemeId,
} from "@/lib/wechat-themes"
import {
  Copy,
  Trash2,
  FileText,
  Eye,
  CheckCheck,
  Columns2,
  Zap,
  ClipboardCopy,
} from "lucide-react"

type ViewMode = "split" | "editor" | "preview"

export function ConverterPage() {
  const {
    value: markdown,
    set: setMarkdown,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useTextHistory(SAMPLE_MARKDOWN)
  const { versions, saveHint, saveNow, remove: removeVersion } = useDraftVersions(markdown)
  const restoredRef = useRef(false)
  const [view, setView] = useState<ViewMode>("split")
  const [copied, setCopied] = useState<"idle" | "rich" | "code">("idle")
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID)

  useEffect(() => {
    const saved = window.localStorage.getItem("md2wx-wechat-theme")
    if (saved && isThemeId(saved)) setThemeId(saved)
  }, [])

  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    const current = loadCurrentDraft()
    if (current != null && current !== "") setMarkdown(current, "push")
  }, [setMarkdown])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      if (e.key.toLowerCase() !== "s") return
      e.preventDefault()
      saveNow()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [saveNow])

  const handleThemeChange = useCallback((id: ThemeId) => {
    setThemeId(id)
    window.localStorage.setItem("md2wx-wechat-theme", id)
  }, [])

  const triggerCopied = (type: "rich" | "code") => {
    setCopied(type)
    setTimeout(() => setCopied("idle"), 2500)
  }

  // Copy as rich text — renders HTML into a hidden element and uses
  // Selection + execCommand('copy') to produce a rich-text clipboard entry.
  // This is the most reliable way to paste into WeChat editor with full styles,
  // because the browser serialises the *rendered* DOM (with computed styles)
  // rather than raw HTML that WeChat's sanitiser would strip.
  const handleCopyRich = useCallback(async () => {
    const html = parseMarkdownToHTML(markdown, themeId)
    const theme = getTheme(themeId)

    // Create an off-screen container with the rendered HTML
    // width:2000px 防止 white-space:pre 的代码块因容器太窄被强制换行
    const container = document.createElement("div")
    container.innerHTML = html
    container.className = "wechat-preview-container"
    container.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;opacity:0;width:2000px;" +
      `font-family:${theme.font};`
    document.body.appendChild(container)

    // Select the rendered content
    const range = document.createRange()
    range.selectNodeContents(container)
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }

    // Copy via execCommand — produces rich text that WeChat respects
    document.execCommand("copy")

    // Clean up
    if (selection) selection.removeAllRanges()
    document.body.removeChild(container)

    triggerCopied("rich")
  }, [markdown, themeId])

  // Copy raw HTML code for advanced users
  const handleCopyCode = useCallback(async () => {
    const html = parseMarkdownToHTML(markdown, themeId)
    await navigator.clipboard.writeText(html)
    triggerCopied("code")
  }, [markdown, themeId])

  const handleClear = useCallback(() => setMarkdown("", "push"), [setMarkdown])
  const handleLoadSample = useCallback(
    () => setMarkdown(SAMPLE_MARKDOWN, "push"),
    [setMarkdown],
  )

  const charCount = markdown.length
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0

  return (
    <div
      className="flex flex-col h-screen font-sans"
      style={{ background: "var(--tool-editor-bg)" }}
    >
      {/* ── Top Navigation Bar ─────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 shrink-0"
        style={{
          height: 56,
          background: "var(--tool-header-bg)",
          borderBottom: "1px solid var(--tool-header-border)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md"
            style={{ background: "var(--brand)" }}
          >
            <Zap size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="flex items-center gap-2">
            <span
              className="font-semibold tracking-tight text-sm"
              style={{ color: "var(--tool-editor-text)" }}
            >
              小华同学ai
            </span>
            <span
              className="text-xs font-semibold tracking-wide px-2.5 py-1 rounded-md"
              style={{
                color: "#fff",
                background: "linear-gradient(135deg, #EA580C 0%, #F97316 100%)",
                boxShadow: "0 1px 3px rgba(232, 93, 4, 0.28)",
                letterSpacing: "0.04em",
              }}
            >
              公众号编辑器
            </span>
          </span>
        </div>

        {/* View switcher — segmented control */}
        <div
          className="hidden md:flex items-center rounded-lg p-0.5 gap-px"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--tool-header-border)",
          }}
        >
          {(
            [
              { key: "split", label: "分屏", icon: <Columns2 size={12} /> },
              { key: "editor", label: "编辑", icon: <FileText size={12} /> },
              { key: "preview", label: "预览", icon: <Eye size={12} /> },
            ] as { key: ViewMode; label: string; icon: React.ReactNode }[]
          ).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={
                view === key
                  ? {
                      background: "var(--tool-header-bg)",
                      color: "var(--tool-editor-text)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--tool-label-text)",
                    }
              }
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-70"
            style={{
              color: "var(--tool-label-text)",
              border: "1px solid var(--tool-divider)",
              background: "transparent",
            }}
          >
            <FileText size={12} />
            载入示例
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-70"
            style={{
              color: "var(--tool-label-text)",
              border: "1px solid var(--tool-divider)",
              background: "transparent",
            }}
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">清空</span>
          </button>
          <button
            onClick={handleCopyCode}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-70"
            style={{
              color: "var(--tool-label-text)",
              border: "1px solid var(--tool-divider)",
              background: "transparent",
            }}
          >
            {copied === "code" ? <CheckCheck size={12} /> : <Copy size={12} />}
            {copied === "code" ? "已复制" : "复制 HTML 代码"}
          </button>
          <button
            onClick={handleCopyRich}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold transition-all active:scale-95"
            style={{
              background: copied === "rich" ? "#16a34a" : "var(--brand)",
              color: "#fff",
              letterSpacing: "0.01em",
            }}
          >
            {copied === "rich" ? <CheckCheck size={13} /> : <ClipboardCopy size={13} />}
            {copied === "rich" ? "已复制，去粘贴！" : "复制到公众号"}
          </button>
        </div>
      </header>

      {/* ── Info strip ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-5 px-6 shrink-0 text-xs"
        style={{
          height: 34,
          borderBottom: "1px solid var(--tool-divider)",
          background: "var(--tool-header-bg)",
          color: "var(--tool-label-text)",
        }}
      >
        <span className="flex items-center gap-1.5 min-w-[7.5rem]">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: saveHint ? "var(--brand)" : "#22c55e" }}
          />
          <span
            style={{
              color: saveHint ? "var(--brand)" : "var(--tool-label-text)",
              transition: "color 200ms",
            }}
          >
            {saveHint ? "已自动保存" : "自动保存"}
          </span>
        </span>
        <span>{charCount.toLocaleString()} 字符</span>
        <span>{wordCount.toLocaleString()} 词</span>
        <VersionPicker
          versions={versions}
          onSave={saveNow}
          onRestore={(v) => setMarkdown(v.content, "push")}
          onRemove={removeVersion}
        />
        <span
          className="ml-auto hidden md:block"
          style={{ color: "var(--tool-label-text)", opacity: 0.7 }}
        >
          点击「复制到公众号」→ 直接粘贴至公众号图文编辑器
        </span>
      </div>

      {/* ── Editor / Preview panels ────────────────────────── */}
      <main className="flex flex-1 min-h-0">
        {/* Editor panel */}
        {(view === "split" || view === "editor") && (
          <div
            className="flex flex-col min-h-0"
            style={{
              width: view === "split" ? "50%" : "100%",
              borderRight:
                view === "split"
                  ? "1px solid var(--tool-divider)"
                  : "none",
              background: "var(--tool-editor-bg)",
            }}
          >
            <PanelLabel icon={<FileText size={11} />} text="Markdown 编辑" />
            <div className="flex-1 overflow-hidden">
              <MarkdownEditor
                value={markdown}
                onChange={setMarkdown}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                placeholder={
                  "在此粘贴或输入 Markdown 内容…\n\n点上方工具栏即可插入标题、列表、链接等，无需背语法"
                }
              />
            </div>
          </div>
        )}

        {/* Preview panel */}
        {(view === "split" || view === "preview") && (
          <div
            className="flex flex-col min-h-0"
            style={{
              width: view === "split" ? "50%" : "100%",
              background: "var(--tool-preview-bg)",
            }}
          >
            <div
              className="flex items-center justify-between gap-3 px-5 shrink-0"
              style={{
                height: 38,
                borderBottom: "1px solid var(--tool-divider)",
                background: "var(--tool-panel-header)",
              }}
            >
              <div
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: "var(--tool-label-text)" }}
              >
                <Eye size={11} />
                微信预览
              </div>
              <ThemePicker value={themeId} onChange={handleThemeChange} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <WechatPreview markdown={markdown} themeId={themeId} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function PanelLabel({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-5 text-xs font-medium shrink-0"
      style={{
        height: 38,
        borderBottom: "1px solid var(--tool-divider)",
        color: "var(--tool-label-text)",
        background: "var(--tool-panel-header)",
      }}
    >
      {icon}
      {text}
    </div>
  )
}
