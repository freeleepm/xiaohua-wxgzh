/**
 * 按时间点存的草稿版本（localStorage）
 *
 * 和撤销栈分开：撤销管「刚才那几步」，版本管「过一会儿还能捞回来」。
 */

export type DraftVersion = {
  id: string
  at: number
  excerpt: string
  content: string
  source: "auto" | "manual"
}

const STORAGE_KEY = "md2wx-draft-versions"
const CURRENT_KEY = "md2wx-draft-current"
export const MAX_DRAFT_VERSIONS = 30

export const excerptOf = (content: string) => {
  const line =
    content
      .split("\n")
      .map((s) => s.replace(/^#{1,6}\s+/, "").trim())
      .find((s) => s.length > 0) ?? "空草稿"
  return line.length > 28 ? line.slice(0, 28) + "…" : line
}

export const formatVersionTime = (at: number) => {
  const d = new Date(at)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const clock = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  const today = now.toDateString()
  const y = new Date(now)
  y.setDate(now.getDate() - 1)
  if (d.toDateString() === today) return `今天 ${clock}`
  if (d.toDateString() === y.toDateString()) return `昨天 ${clock}`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${clock}`
}

export const loadDraftVersions = (): DraftVersion[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DraftVersion[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const loadCurrentDraft = (): string | null => {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(CURRENT_KEY)
  } catch {
    return null
  }
}

export const saveCurrentDraft = (content: string) => {
  window.localStorage.setItem(CURRENT_KEY, content)
}

export const saveDraftVersions = (list: DraftVersion[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export const makeVersion = (
  content: string,
  source: DraftVersion["source"],
): DraftVersion => {
  const at = Date.now()
  return {
    id: String(at),
    at,
    excerpt: excerptOf(content),
    content,
    source,
  }
}

export const pushVersion = (
  list: DraftVersion[],
  content: string,
  source: DraftVersion["source"],
): DraftVersion[] => {
  const trimmed = content
  if (!trimmed.trim()) return list
  if (list[0]?.content === trimmed) return list
  return [makeVersion(trimmed, source), ...list].slice(0, MAX_DRAFT_VERSIONS)
}
