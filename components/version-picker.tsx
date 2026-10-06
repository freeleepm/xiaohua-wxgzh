"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, History, Save, Trash2 } from "lucide-react"
import {
  formatVersionTime,
  type DraftVersion,
} from "@/lib/draft-versions"

export function VersionPicker({
  versions,
  onSave,
  onRestore,
  onRemove,
}: {
  versions: DraftVersion[]
  onSave: () => boolean | void
  onRestore: (version: DraftVersion) => void
  onRemove: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [hint, setHint] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const latest = versions[0]

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium"
        style={{
          color: "var(--tool-editor-text)",
          background: "var(--tool-header-bg)",
          boxShadow: "0 0 0 1px var(--tool-divider)",
        }}
        title="按时间点保存的草稿，删错了可以从这里恢复。⌘S / Ctrl+S 立即保存"
      >
        <History size={12} />
        <span>历史版本</span>
        {latest && (
          <span style={{ color: "var(--tool-label-text)" }}>
            {formatVersionTime(latest.at)}
          </span>
        )}
        <ChevronDown
          size={12}
          style={{
            color: "var(--tool-label-text)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 150ms",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] rounded-lg py-1.5 overflow-hidden"
          style={{
            background: "var(--tool-header-bg)",
            boxShadow:
              "0 0 0 1px var(--tool-divider), 0 12px 32px rgba(15,23,42,0.12)",
          }}
        >
          <div className="px-3 pt-1.5 pb-2 flex items-center justify-between gap-2">
            <span
              className="text-[10px] font-medium tracking-wide"
              style={{ color: "var(--tool-label-text)" }}
            >
              停笔后自动保存当前稿 · 时间版本最多 30 条
            </span>
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] font-medium"
              style={{ color: "var(--brand)" }}
              title="立即保存当前稿（⌘S / Ctrl+S）"
              onClick={() => {
                const ok = onSave()
                setHint(ok === false ? "与最新版本相同" : "已记下当前稿")
                window.setTimeout(() => setHint(""), 1600)
              }}
            >
              <Save size={11} />
              立即保存
            </button>
          </div>
          {hint && (
            <div
              className="px-3 pb-1 text-[11px]"
              style={{ color: "var(--brand)" }}
            >
              {hint}
            </div>
          )}

          {versions.length === 0 ? (
            <div
              className="px-3 py-6 text-xs text-center"
              style={{ color: "var(--tool-label-text)" }}
            >
              还没有版本。写一会儿会自动记一笔，也可点「立即保存」。
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {versions.map((v, i) => (
                <div
                  key={v.id}
                  className="flex items-start gap-1 px-2 py-1.5"
                  style={{
                    background: i === 0 ? "var(--tool-panel-header)" : "transparent",
                  }}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left px-1"
                    onClick={() => {
                      onRestore(v)
                      setOpen(false)
                    }}
                  >
                    <span
                      className="flex items-center gap-1.5 text-[13px] font-medium leading-tight"
                      style={{ color: "var(--tool-editor-text)" }}
                    >
                      {formatVersionTime(v.at)}
                      {i === 0 && (
                        <Check size={12} style={{ color: "var(--brand)" }} />
                      )}
                      {v.source === "manual" && (
                        <span
                          className="text-[10px] font-normal"
                          style={{ color: "var(--brand)" }}
                        >
                          手动
                        </span>
                      )}
                    </span>
                    <span
                      className="block mt-0.5 text-[11px] truncate"
                      style={{ color: "var(--tool-label-text)" }}
                    >
                      {v.excerpt}
                    </span>
                  </button>
                  <button
                    type="button"
                    title="删除这个版本"
                    className="p-1.5 rounded-md shrink-0"
                    style={{ color: "var(--tool-label-text)" }}
                    onClick={() => onRemove(v.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
