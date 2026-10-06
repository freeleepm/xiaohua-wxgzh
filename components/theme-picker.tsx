"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, Palette } from "lucide-react"
import { WECHAT_THEMES, getTheme, type ThemeId } from "@/lib/wechat-themes"

export function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeId
  onChange: (id: ThemeId) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = getTheme(value)

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

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-7 pl-1.5 pr-2 rounded-md text-xs font-medium"
        style={{
          color: "var(--tool-editor-text)",
          background: "var(--tool-header-bg)",
          boxShadow: "0 0 0 1px var(--tool-divider)",
        }}
      >
        <span
          className="inline-block w-3.5 h-3.5 rounded-sm shrink-0"
          style={{ background: current.swatch }}
        />
        <span className="hidden sm:inline">{current.name}</span>
        <Palette size={12} className="sm:hidden" />
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
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[240px] rounded-lg py-1.5 overflow-hidden"
          style={{
            background: "var(--tool-header-bg)",
            boxShadow:
              "0 0 0 1px var(--tool-divider), 0 12px 32px rgba(15,23,42,0.12)",
          }}
        >
          <div
            className="px-3 pt-1.5 pb-2 text-[10px] font-medium tracking-wide"
            style={{ color: "var(--tool-label-text)" }}
          >
            公众号排版主题
          </div>
          {WECHAT_THEMES.map((theme) => {
            const active = value === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  onChange(theme.id)
                  setOpen(false)
                }}
                className="flex items-start gap-2.5 w-full px-3 py-2 text-left"
                style={{
                  background: active ? "var(--tool-panel-header)" : "transparent",
                }}
              >
                <span
                  className="mt-0.5 inline-block w-3.5 h-8 rounded-sm shrink-0"
                  style={{ background: theme.swatch }}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className="flex items-center justify-between gap-2 text-[13px] font-medium leading-tight"
                    style={{ color: "var(--tool-editor-text)" }}
                  >
                    {theme.name}
                    {active && <Check size={13} style={{ color: theme.swatch }} />}
                  </span>
                  <span
                    className="block mt-0.5 text-[11px] leading-snug"
                    style={{ color: "var(--tool-label-text)" }}
                  >
                    {theme.desc}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
