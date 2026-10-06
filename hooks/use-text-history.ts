/**
 * 文本历史：past / present / future
 *
 * set(debounce)  — 输入时：界面立刻变，400ms 后记一笔
 * set(push)      — 工具栏 / 清空 / 载入：立刻记一笔
 */

import { useCallback, useRef, useState } from "react"

const MAX_STACK = 100
const DEBOUNCE_MS = 400

export function useTextHistory(initial: string) {
  const [value, setValueState] = useState(initial)
  const [, setTick] = useState(0)

  const valueRef = useRef(initial)
  const baselineRef = useRef(initial)
  const pastRef = useRef<string[]>([])
  const futureRef = useRef<string[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const notify = () => setTick((n) => n + 1)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const pushPast = (snapshot: string) => {
    const stack = pastRef.current
    if (stack[stack.length - 1] === snapshot) return
    pastRef.current = [...stack.slice(-(MAX_STACK - 1)), snapshot]
    futureRef.current = []
  }

  /** 把未落盘的输入先收成一步历史 */
  const settleTyping = () => {
    clearTimer()
    const current = valueRef.current
    if (current !== baselineRef.current) {
      pushPast(baselineRef.current)
      baselineRef.current = current
    }
  }

  const set = useCallback((next: string, mode: "debounce" | "push" = "debounce") => {
    if (mode === "push") {
      clearTimer()
      const current = valueRef.current
      if (next === current) return
      pushPast(current)
      valueRef.current = next
      baselineRef.current = next
      setValueState(next)
      notify()
      return
    }

    valueRef.current = next
    setValueState(next)
    clearTimer()
    timerRef.current = setTimeout(() => {
      const latest = valueRef.current
      if (latest !== baselineRef.current) {
        pushPast(baselineRef.current)
        baselineRef.current = latest
        notify()
      }
      timerRef.current = null
    }, DEBOUNCE_MS)
  }, [])

  const undo = useCallback(() => {
    settleTyping()
    const current = valueRef.current
    if (pastRef.current.length === 0) {
      notify()
      return
    }
    const prev = pastRef.current[pastRef.current.length - 1]
    pastRef.current = pastRef.current.slice(0, -1)
    futureRef.current = [...futureRef.current, current]
    valueRef.current = prev
    baselineRef.current = prev
    setValueState(prev)
    notify()
  }, [])

  const redo = useCallback(() => {
    clearTimer()
    if (futureRef.current.length === 0) return
    const current = valueRef.current
    const next = futureRef.current[futureRef.current.length - 1]
    futureRef.current = futureRef.current.slice(0, -1)
    pastRef.current = [...pastRef.current, current]
    valueRef.current = next
    baselineRef.current = next
    setValueState(next)
    notify()
  }, [])

  const canUndo =
    pastRef.current.length > 0 || valueRef.current !== baselineRef.current
  const canRedo = futureRef.current.length > 0

  return {
    value,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
