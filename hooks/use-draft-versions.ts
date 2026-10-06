/**
 * 自动保存分两层，避免边打字边把 30 份全文 JSON 写进 localStorage：
 *
 * 1. 当前稿  — 停笔约 1.2s 后写一条字符串（刷新靠它恢复）
 * 2. 时间版本 — 停笔约 45s 且内容有变化才追加，关页也会补一笔
 *
 * 写盘走 idle，保存提示只在写成功后闪一下，不抢焦点。
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  loadCurrentDraft,
  loadDraftVersions,
  pushVersion,
  saveCurrentDraft,
  saveDraftVersions,
  type DraftVersion,
} from "@/lib/draft-versions"

const CURRENT_IDLE_MS = 1200
const VERSION_IDLE_MS = 45000
const HINT_MS = 1800

const runIdle = (fn: () => void) => {
  if (typeof requestIdleCallback === "function") {
    return requestIdleCallback(fn, { timeout: 600 })
  }
  return window.setTimeout(fn, 0)
}

const cancelIdle = (id: number) => {
  if (typeof cancelIdleCallback === "function") {
    cancelIdleCallback(id)
  } else {
    window.clearTimeout(id)
  }
}

export function useDraftVersions(content: string) {
  const [versions, setVersions] = useState<DraftVersion[]>([])
  const [saveHint, setSaveHint] = useState(false)

  const versionsRef = useRef<DraftVersion[]>([])
  const contentRef = useRef(content)
  const lastCurrentRef = useRef<string | null>(null)
  const lastVersionContentRef = useRef<string | null>(null)
  const hintTimerRef = useRef<number | null>(null)
  const idleRef = useRef<number | null>(null)

  contentRef.current = content
  versionsRef.current = versions

  const pulseHint = useCallback(() => {
    setSaveHint(true)
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current)
    hintTimerRef.current = window.setTimeout(() => setSaveHint(false), HINT_MS)
  }, [])

  const writeCurrent = useCallback((text: string, showHint: boolean) => {
    if (lastCurrentRef.current === text) return false
    lastCurrentRef.current = text
    saveCurrentDraft(text)
    if (showHint) pulseHint()
    return true
  }, [pulseHint])

  const writeVersion = useCallback((source: DraftVersion["source"]) => {
    const text = contentRef.current
    if (lastVersionContentRef.current === text) return false
    const next = pushVersion(versionsRef.current, text, source)
    if (next === versionsRef.current) return false
    versionsRef.current = next
    lastVersionContentRef.current = text
    setVersions(next)
    saveDraftVersions(next)
    return true
  }, [])

  useEffect(() => {
    const list = loadDraftVersions()
    setVersions(list)
    lastVersionContentRef.current = list[0]?.content ?? null
    lastCurrentRef.current = loadCurrentDraft()
  }, [])

  // 停笔后写当前稿
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (idleRef.current != null) cancelIdle(idleRef.current)
      idleRef.current = runIdle(() => {
        idleRef.current = null
        writeCurrent(contentRef.current, true)
      })
    }, CURRENT_IDLE_MS)
    return () => {
      window.clearTimeout(timer)
      if (idleRef.current != null) {
        cancelIdle(idleRef.current)
        idleRef.current = null
      }
    }
  }, [content, writeCurrent])

  // 长时间停笔才记时间版本
  useEffect(() => {
    const timer = window.setTimeout(() => writeVersion("auto"), VERSION_IDLE_MS)
    return () => window.clearTimeout(timer)
  }, [content, writeVersion])

  useEffect(() => {
    const flush = () => {
      writeCurrent(contentRef.current, false)
      writeVersion("auto")
    }
    const onHide = () => {
      if (document.visibilityState === "hidden") flush()
    }
    window.addEventListener("beforeunload", flush)
    document.addEventListener("visibilitychange", onHide)
    return () => {
      window.removeEventListener("beforeunload", flush)
      document.removeEventListener("visibilitychange", onHide)
    }
  }, [writeCurrent, writeVersion])

  const remove = useCallback((id: string) => {
    const next = versionsRef.current.filter((v) => v.id !== id)
    versionsRef.current = next
    setVersions(next)
    saveDraftVersions(next)
  }, [])

  const saveNow = useCallback(() => {
    writeCurrent(contentRef.current, false)
    const added = writeVersion("manual")
    pulseHint()
    return added
  }, [writeCurrent, writeVersion, pulseHint])

  return {
    versions,
    saveHint,
    saveNow,
    remove,
  }
}
