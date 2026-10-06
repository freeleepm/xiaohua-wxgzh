"use client"

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Redo2, Undo2 } from "lucide-react"
import { MD_TOOL_ICONS } from "@/components/md-tool-icons"
import {
  MD_TOOL_DEFS,
  type InsertDialogKind,
  type MdAction,
  type MdToolDef,
} from "@/lib/md-edit"

const MENU_GROUPS: { title: string; group: MdToolDef["group"] }[] = [
  { title: "文字样式", group: "inline" },
  { title: "标题", group: "heading" },
  { title: "段落结构", group: "block" },
  { title: "插入内容", group: "insert" },
]

export function MarkdownContextMenu({
  open,
  x,
  y,
  onClose,
  onAction,
  onOpenDialog,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  open: boolean
  x: number
  y: number
  onClose: () => void
  onAction: (action: MdAction) => void
  onOpenDialog: (kind: InsertDialogKind) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!open || !el) return
    const rect = el.getBoundingClientRect()
    const pad = 8
    let left = x
    let top = y
    if (left + rect.width > window.innerWidth - pad) {
      left = Math.max(pad, window.innerWidth - rect.width - pad)
    }
    if (top + rect.height > window.innerHeight - pad) {
      top = Math.max(pad, window.innerHeight - rect.height - pad)
    }
    el.style.left = `${left}px`
    el.style.top = `${top}px`
  }, [open, x, y])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    // 延后绑定：避免打开菜单的那次 pointerup / click 立刻把菜单关掉
    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onClose)
      document.addEventListener("keydown", onKey)
    }, 0)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("mousedown", onClose)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open || typeof document === "undefined") return null

  const run = (fn: () => void) => {
    onClose()
    // 等菜单卸掉后再执行，避免和焦点/点击冲突
    window.setTimeout(fn, 0)
  }

  return createPortal(
    <div
      ref={ref}
      role="menu"
      className="fixed z-[80] w-52 rounded-lg py-1 overflow-hidden"
      style={{
        left: x,
        top: y,
        background: "var(--tool-header-bg)",
        boxShadow:
          "0 0 0 1px var(--tool-divider), 0 12px 32px rgba(15,23,42,0.14)",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <MenuLabel>快捷排版</MenuLabel>
      <MenuItem
        disabled={!canUndo}
        icon={<Undo2 size={14} />}
        label="撤销"
        hint="⌘Z"
        onClick={() => run(onUndo)}
      />
      <MenuItem
        disabled={!canRedo}
        icon={<Redo2 size={14} />}
        label="重做"
        hint="⇧⌘Z"
        onClick={() => run(onRedo)}
      />

      {MENU_GROUPS.map(({ title, group }) => {
        const tools = MD_TOOL_DEFS.filter((t) => t.group === group)
        if (!tools.length) return null
        return (
          <div key={group}>
            <div
              className="my-1 h-px"
              style={{ background: "var(--tool-divider)" }}
            />
            <MenuLabel>{title}</MenuLabel>
            {tools.map((tool) => (
              <MenuItem
                key={tool.id}
                icon={MD_TOOL_ICONS[tool.id]}
                label={tool.label}
                hint={
                  tool.id === "bold"
                    ? "⌘B"
                    : tool.id === "italic"
                      ? "⌘I"
                      : tool.id === "link"
                        ? "⌘K"
                        : undefined
                }
                onClick={() =>
                  run(() => {
                    if (tool.kind === "dialog" && tool.dialog) {
                      onOpenDialog(tool.dialog)
                      return
                    }
                    if (tool.action) onAction(tool.action)
                  })
                }
              />
            ))}
          </div>
        )
      })}
    </div>,
    document.body,
  )
}

function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-3 pt-1.5 pb-1 text-[10px] font-medium tracking-wide"
      style={{ color: "var(--tool-label-text)" }}
    >
      {children}
    </div>
  )
}

function MenuItem({
  icon,
  label,
  hint,
  disabled,
  onClick,
}: {
  icon: ReactNode
  label: string
  hint?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-left disabled:opacity-40"
      style={{ color: "var(--tool-editor-text)" }}
      onMouseEnter={(e) => {
        if (disabled) return
        e.currentTarget.style.background = "var(--brand-light)"
        e.currentTarget.style.color = "var(--brand)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.color = "var(--tool-editor-text)"
      }}
    >
      <span className="flex w-4 items-center justify-center shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && (
        <span
          className="text-[10px] tracking-wide"
          style={{ color: "var(--tool-label-text)" }}
        >
          {hint}
        </span>
      )}
    </button>
  )
}
