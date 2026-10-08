"use client"

import { useCallback, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  applyMdAction,
  insertAtCursor,
  type InsertDialogKind,
  type MdAction,
} from "@/lib/md-edit"
import { MarkdownToolbar } from "@/components/markdown-toolbar"
import { MarkdownContextMenu } from "@/components/markdown-context-menu"
import { MdInsertDialog } from "@/components/md-insert-dialog"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string, mode?: "debounce" | "push") => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  /** markdown：工具栏可用；html：纯源码编辑 */
  sourceMode?: "markdown" | "html"
  placeholder?: string
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  sourceMode = "markdown",
  placeholder,
  className,
}: MarkdownEditorProps) {
  const isHtml = sourceMode === "html"
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [dialogKind, setDialogKind] = useState<InsertDialogKind | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const selectionRef = useRef({ start: 0, end: 0 })
  const [menu, setMenu] = useState({ open: false, x: 0, y: 0 })

  const captureSelection = useCallback(() => {
    const el = textareaRef.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    selectionRef.current = { start, end }
    setSelectedText(value.slice(start, end))
    return { start, end }
  }, [value])

  const restoreSelection = (start: number, end: number) => {
    requestAnimationFrame(() => {
      if (!textareaRef.current) return
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(start, end)
    })
  }

  const closeMenu = useCallback(() => {
    setMenu((m) => (m.open ? { ...m, open: false } : m))
  }, [])

  const runAction = useCallback(
    (action: MdAction) => {
      closeMenu()
      const { start, end } = selectionRef.current
      const next = applyMdAction(value, start, end, action)
      onChange(next.value, "push")
      restoreSelection(next.selectionStart, next.selectionEnd)
    },
    [value, onChange, closeMenu],
  )

  const openDialog = useCallback(
    (kind: InsertDialogKind) => {
      closeMenu()
      // 用已缓存选区，避免弹层抢走焦点后读到空选区
      setSelectedText(
        value.slice(selectionRef.current.start, selectionRef.current.end),
      )
      setDialogKind(kind)
      setDialogOpen(true)
    },
    [value, closeMenu],
  )

  const handleInsertSnippet = useCallback(
    (snippet: string) => {
      const { start, end } = selectionRef.current
      const next = insertAtCursor(value, start, end, snippet)
      onChange(next.value, "push")
      restoreSelection(next.selectionStart, next.selectionEnd)
    },
    [value, onChange],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" && menu.open) {
      e.preventDefault()
      closeMenu()
      return
    }

    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue, "debounce")
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2
          textareaRef.current.selectionEnd = start + 2
        }
      })
      return
    }

    const meta = e.metaKey || e.ctrlKey
    if (!meta) return

    const key = e.key.toLowerCase()

    if (key === "z") {
      e.preventDefault()
      if (e.shiftKey) onRedo()
      else onUndo()
      return
    }
    if (key === "y") {
      e.preventDefault()
      onRedo()
      return
    }

    if (isHtml) return

    const shortcut: Record<string, MdAction | undefined> = {
      b: { type: "wrap", before: "**", after: "**", empty: "加粗文字" },
      i: { type: "wrap", before: "*", after: "*", empty: "斜体文字" },
      e: { type: "wrap", before: "`", after: "`", empty: "code" },
    }
    if (key === "k") {
      e.preventDefault()
      captureSelection()
      openDialog("link")
      return
    }
    const action = shortcut[key]
    if (!action) return
    e.preventDefault()
    captureSelection()
    runAction(action)
  }

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {!isHtml && (
        <MarkdownToolbar
          onAction={(action) => {
            captureSelection()
            runAction(action)
          }}
          onOpenDialog={(kind) => {
            captureSelection()
            openDialog(kind)
          }}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      )}
      {isHtml && (
        <div
          className="flex items-center gap-2 px-4 shrink-0 text-[11px]"
          style={{
            height: 36,
            borderBottom: "1px solid var(--tool-divider)",
            color: "var(--tool-label-text)",
            background: "var(--tool-panel-header)",
          }}
        >
          粘贴 HTML 源码：保留自定义样式，微信兼容后可「复制到公众号」
        </div>
      )}
      <div className="flex-1 min-h-0 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value, "debounce")}
          onKeyDown={handleKeyDown}
          onSelect={captureSelection}
          onKeyUp={captureSelection}
          onContextMenu={(e) => {
            if (isHtml) return
            e.preventDefault()
            captureSelection()
            setMenu({ open: true, x: e.clientX, y: e.clientY })
          }}
          onMouseDown={() => {
            if (menu.open) closeMenu()
          }}
          placeholder={placeholder}
          spellCheck={false}
          className={cn(
            "absolute inset-0 w-full h-full resize-none bg-transparent font-mono text-sm leading-relaxed",
            "focus:outline-none",
            "p-5",
          )}
          style={{
            color: "var(--tool-editor-text)",
            caretColor: "var(--brand)",
          }}
        />
      </div>
      {!isHtml && (
        <>
          <MarkdownContextMenu
            open={menu.open}
            x={menu.x}
            y={menu.y}
            onClose={closeMenu}
            onAction={runAction}
            onOpenDialog={openDialog}
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
          <MdInsertDialog
            kind={dialogKind}
            open={dialogOpen}
            selectedText={selectedText}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) setDialogKind(null)
            }}
            onInsert={handleInsertSnippet}
          />
        </>
      )}
    </div>
  )
}
