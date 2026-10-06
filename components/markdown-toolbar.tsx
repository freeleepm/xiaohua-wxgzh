"use client"

import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight, Redo2, Undo2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { MD_TOOL_ICONS } from "@/components/md-tool-icons"
import {
  MD_TOOL_DEFS,
  type InsertDialogKind,
  type MdAction,
  type MdToolDef,
} from "@/lib/md-edit"

/** 工具栏短标签：省宽度，完整说明放 tip */
const SHORT_LABEL: Record<string, string> = {
  h1: "一级",
  h2: "二级",
  h3: "三级",
  bold: "粗体",
  italic: "斜体",
  strike: "删除",
  code: "代码",
  quote: "引用",
  ul: "列表",
  ol: "序号",
  hr: "分割",
  link: "链接",
  image: "图片",
  fence: "代码块",
  table: "表格",
}

const ROW_A: MdToolDef["group"][] = ["heading", "inline"]
const ROW_B: MdToolDef["group"][] = ["block", "insert"]

export function MarkdownToolbar({
  onAction,
  onOpenDialog,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  onAction: (action: MdAction) => void
  onOpenDialog: (kind: InsertDialogKind) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}) {
  return (
    <div
      className="shrink-0 flex flex-col"
      style={{
        borderBottom: "1px solid var(--tool-divider)",
        background: "var(--tool-panel-header)",
      }}
      role="toolbar"
      aria-label="Markdown 格式工具"
    >
      <ToolRow>
        <div className="flex items-center gap-0.5 shrink-0">
          <HistoryButton
            tip="撤销 (⌘Z)"
            disabled={!canUndo}
            onClick={onUndo}
            icon={<Undo2 size={14} />}
            label="撤销"
          />
          <HistoryButton
            tip="重做 (⌘⇧Z)"
            disabled={!canRedo}
            onClick={onRedo}
            icon={<Redo2 size={14} />}
            label="重做"
          />
          <Sep />
        </div>
        <ScrollRail>
          {ROW_A.map((group, i) => (
            <GroupChunk
              key={group}
              group={group}
              showSep={i > 0}
              onAction={onAction}
              onOpenDialog={onOpenDialog}
            />
          ))}
        </ScrollRail>
      </ToolRow>

      <div style={{ borderTop: "1px solid var(--tool-divider)" }}>
        <ToolRow>
          <ScrollRail>
            {ROW_B.map((group, i) => (
              <GroupChunk
                key={group}
                group={group}
                showSep={i > 0}
                onAction={onAction}
                onOpenDialog={onOpenDialog}
              />
            ))}
          </ScrollRail>
        </ToolRow>
      </div>
    </div>
  )
}

function ToolRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-0 min-w-0 px-1.5" style={{ height: 36 }}>
      {children}
    </div>
  )
}

function Sep() {
  return (
    <span
      className="mx-1 w-px h-4 shrink-0"
      style={{ background: "var(--tool-divider)" }}
    />
  )
}

/**
 * 可滚动轨道：溢出时左右箭头 + 边缘渐隐，提示还能往旁边看
 */
function ScrollRail({ children }: { children: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanLeft(scrollLeft > 2)
    setCanRight(scrollLeft + clientWidth < scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [update])

  const scrollBy = (dir: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" })
  }

  return (
    <div className="relative flex-1 min-w-0 h-full flex items-center">
      {canLeft && (
        <>
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-[1]"
            style={{
              background:
                "linear-gradient(to right, var(--tool-panel-header) 30%, transparent)",
            }}
          />
          <button
            type="button"
            aria-label="向左查看更多工具"
            title="更多工具"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollBy(-1)}
            className="absolute left-0 z-[2] flex items-center justify-center w-6 h-6 rounded-full shadow-sm"
            style={{
              background: "var(--tool-header-bg)",
              color: "var(--brand)",
              boxShadow: "0 0 0 1px var(--tool-divider)",
            }}
          >
            <ChevronLeft size={14} />
          </button>
        </>
      )}

      <div
        ref={scrollerRef}
        className="flex items-center gap-0.5 overflow-x-auto min-w-0 w-full h-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {canRight && (
        <>
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-[1]"
            style={{
              background:
                "linear-gradient(to left, var(--tool-panel-header) 30%, transparent)",
            }}
          />
          <button
            type="button"
            aria-label="向右查看更多工具"
            title="更多工具"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollBy(1)}
            className="absolute right-0 z-[2] flex items-center justify-center w-6 h-6 rounded-full shadow-sm"
            style={{
              background: "var(--tool-header-bg)",
              color: "var(--brand)",
              boxShadow: "0 0 0 1px var(--tool-divider)",
            }}
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}
    </div>
  )
}

function GroupChunk({
  group,
  showSep,
  onAction,
  onOpenDialog,
}: {
  group: MdToolDef["group"]
  showSep: boolean
  onAction: (action: MdAction) => void
  onOpenDialog: (kind: InsertDialogKind) => void
}) {
  const tools = MD_TOOL_DEFS.filter((t) => t.group === group)
  if (!tools.length) return null
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {showSep && <Sep />}
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          tool={tool}
          onClick={() => {
            if (tool.kind === "dialog" && tool.dialog) {
              onOpenDialog(tool.dialog)
              return
            }
            if (tool.action) onAction(tool.action)
          }}
        />
      ))}
    </div>
  )
}

function HistoryButton({
  tip,
  label,
  icon,
  disabled,
  onClick,
}: {
  tip: string
  label: string
  icon: ReactNode
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={tip}
      aria-label={tip}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex items-center gap-1 h-7 px-1.5 rounded-md text-[11px] font-medium shrink-0 transition-colors disabled:opacity-35"
      style={{ color: "var(--tool-label-text)" }}
      onMouseEnter={(e) => {
        if (disabled) return
        e.currentTarget.style.background = "var(--brand-light)"
        e.currentTarget.style.color = "var(--brand)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.color = "var(--tool-label-text)"
      }}
    >
      {icon}
      <span className="leading-none">{label}</span>
    </button>
  )
}

function ToolButton({
  tool,
  onClick,
}: {
  tool: MdToolDef
  onClick: () => void
}) {
  const label = SHORT_LABEL[tool.id] ?? tool.label
  return (
    <button
      type="button"
      title={tool.tip}
      aria-label={tool.tip}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex items-center gap-1 h-7 px-1.5 rounded-md text-[11px] font-medium shrink-0 transition-colors"
      style={{ color: "var(--tool-label-text)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--brand-light)"
        e.currentTarget.style.color = "var(--brand)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.color = "var(--tool-label-text)"
      }}
    >
      {MD_TOOL_ICONS[tool.id]}
      <span className="leading-none whitespace-nowrap">{label}</span>
    </button>
  )
}
