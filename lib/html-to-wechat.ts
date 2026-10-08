/**
 * 将外部 HTML 转为微信公众号可粘贴的 HTML
 *
 * 流程：消毒 → div 换 section → 去掉 flex/grid → 补主题内联样式 → 输出
 * 仅浏览器端使用（DOMParser）。
 */

import { DEFAULT_THEME_ID, getTheme, type ThemeId, type WechatTheme } from "./wechat-themes"
import {
  renderH1,
  renderH2,
  renderH3,
  renderH4,
  renderH5,
  renderH6,
  renderHr,
  renderInlineCode,
  renderParagraph,
  renderQuote,
} from "./wechat-render"

const DROP_TAGS = new Set([
  "script",
  "style",
  "link",
  "meta",
  "noscript",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "svg",
  "canvas",
  "video",
  "audio",
  "template",
])

const BLOCK_HEADING = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])

const stripDangerousAttrs = (el: Element) => {
  const remove: string[] = []
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase()
    if (name.startsWith("on") || name === "srcdoc") remove.push(attr.name)
    if ((name === "href" || name === "src") && /^\s*javascript:/i.test(attr.value)) {
      remove.push(attr.name)
    }
  }
  remove.forEach((n) => el.removeAttribute(n))
}

const hasOwnBackground = (style: string) =>
  /background(-color|-image)?\s*:/i.test(style)

const sanitizeCss = (css: string) =>
  css
    .replace(/expression\s*\(/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/-moz-binding\s*:/gi, "")
    .replace(/behavior\s*:/gi, "")
    // 微信常剥 flex / grid，改为块级更稳
    .replace(/display\s*:\s*flex\b/gi, "display:block")
    .replace(/display\s*:\s*inline-flex\b/gi, "display:inline-block")
    .replace(/display\s*:\s*grid\b/gi, "display:block")
    .replace(/display\s*:\s*inline-grid\b/gi, "display:inline-block")
    .replace(/gap\s*:[^;]+;?/gi, "")
    .replace(/grid-[^:;]+:[^;]+;?/gi, "")
    .replace(/flex(-[a-z]+)?\s*:[^;]+;?/gi, "")

const mergeStyle = (el: Element, extra: string) => {
  const prev = el.getAttribute("style") || ""
  const next = sanitizeCss(`${prev};${extra}`.replace(/;;+/g, ";").replace(/^;|;$/g, ""))
  if (next) el.setAttribute("style", next)
  else el.removeAttribute("style")
}

const replaceWithHtml = (el: Element, html: string) => {
  const wrap = el.ownerDocument.createElement("section")
  wrap.innerHTML = html
  const parent = el.parentNode
  if (!parent) return
  while (wrap.firstChild) parent.insertBefore(wrap.firstChild, el)
  parent.removeChild(el)
}

const textOf = (el: Element) => (el.textContent || "").replace(/\s+/g, " ").trim()

const innerKeep = (el: Element) => {
  // 保留子节点 HTML（已消毒）
  return el.innerHTML
}

const styleCodeBlock = (pre: Element, theme: WechatTheme) => {
  const code = pre.querySelector("code")
  const raw = (code?.textContent || pre.textContent || "").replace(/\n$/, "")
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  const html =
    `<section style="margin:16px 0;background:#1a1a1a;border-radius:8px;overflow:hidden;">` +
    `<section style="padding:14px 16px;overflow:auto;">` +
    `<span style="display:block;white-space:pre;font-family:Menlo,Consolas,monospace;` +
    `font-size:13px;line-height:1.6;color:#abb2bf;">${escaped}</span>` +
    `</section></section>`
  replaceWithHtml(pre, html)
  void theme
}

const applyThemeToBare = (el: Element, theme: WechatTheme) => {
  const tag = el.tagName.toLowerCase()
  const style = el.getAttribute("style") || ""

  if (tag === "hr") {
    replaceWithHtml(el, renderHr(theme))
    return
  }

  if (BLOCK_HEADING.has(tag) && !hasOwnBackground(style)) {
    const t = textOf(el)
    if (!t) return
    const map: Record<string, (s: string, th: WechatTheme) => string> = {
      h1: renderH1,
      h2: renderH2,
      h3: renderH3,
      h4: renderH4,
      h5: renderH5,
      h6: renderH6,
    }
    replaceWithHtml(el, map[tag](t, theme))
    return
  }

  if (tag === "blockquote" && !hasOwnBackground(style)) {
    replaceWithHtml(el, renderQuote(innerKeep(el), theme))
    return
  }

  if (tag === "p" && !style.trim()) {
    // 段落无样式时套主题，但保留内部 HTML
    const body = innerKeep(el)
    if (!body.trim()) return
    // renderParagraph 期望已是内联 HTML 字符串
    replaceWithHtml(el, renderParagraph(body, theme))
    return
  }

  if (tag === "a") {
    const href = el.getAttribute("href") || "#"
    mergeStyle(
      el,
      `color:${theme.link};text-decoration:none;border-bottom:1px solid ${theme.linkBorder};`,
    )
    el.setAttribute("href", href)
    return
  }

  if (tag === "img") {
    mergeStyle(el, "max-width:100%;height:auto;display:block;margin:12px auto;")
    return
  }

  if (tag === "strong" || tag === "b") {
    mergeStyle(el, `font-weight:700;color:${theme.bold};`)
    return
  }

  if (tag === "em" || tag === "i") {
    mergeStyle(el, `font-style:italic;color:${theme.italic};`)
    return
  }

  if (tag === "code" && el.parentElement?.tagName.toLowerCase() !== "pre") {
    const t = textOf(el)
    replaceWithHtml(el, renderInlineCode(t, theme))
    return
  }

  if (tag === "pre") {
    styleCodeBlock(el, theme)
    return
  }

  if (tag === "table") {
    mergeStyle(el, `border-collapse:collapse;width:100%;margin:14px 0;font-size:14px;color:${theme.text};`)
    return
  }

  if (tag === "th" || tag === "td") {
    mergeStyle(
      el,
      `border:1px solid ${theme.table.border};padding:8px 10px;` +
        (tag === "th"
          ? `background:${theme.table.headBg};color:${theme.table.headColor};font-weight:600;`
          : `color:${theme.table.cell};`),
    )
    return
  }

  if (tag === "li") {
    mergeStyle(el, `margin:6px 0;line-height:1.75;color:${theme.text};`)
    return
  }

  if (tag === "ul" || tag === "ol") {
    mergeStyle(el, "margin:10px 0 10px 1.2em;padding:0;")
    return
  }
}

const walk = (root: Element, theme: WechatTheme) => {
  const nodes = Array.from(root.querySelectorAll("*"))
  // 先删危险标签
  for (const el of nodes) {
    const tag = el.tagName.toLowerCase()
    if (DROP_TAGS.has(tag)) {
      el.remove()
      continue
    }
    stripDangerousAttrs(el)
    const st = el.getAttribute("style")
    if (st) el.setAttribute("style", sanitizeCss(st))
  }

  // div → section（背景才能在微信里站住）
  const divs = Array.from(root.querySelectorAll("div"))
  for (const div of divs) {
    const section = root.ownerDocument.createElement("section")
    for (const attr of Array.from(div.attributes)) {
      section.setAttribute(attr.name, attr.value)
    }
    while (div.firstChild) section.appendChild(div.firstChild)
    div.parentNode?.replaceChild(section, div)
  }

  // 再主题化（倒序，避免替换后影响遍历）
  const again = Array.from(root.querySelectorAll("*")).reverse()
  for (const el of again) {
    if (!el.isConnected) continue
    applyThemeToBare(el, theme)
  }
}

const extractBodyHtml = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  // 完整文档取 body
  const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) return bodyMatch[1]
  return trimmed
}

export const looksLikeHtml = (source: string) => {
  const s = source.trim()
  if (!s) return false
  if (/^<!doctype\s+html/i.test(s) || /^<html[\s>]/i.test(s)) return true
  // 明显标签密度
  const tags = s.match(/<\/?[a-zA-Z][^>]*>/g)
  if (!tags || tags.length < 2) return false
  return tags.length >= 3 || /<(p|div|section|h[1-6]|table|ul|ol|article)\b/i.test(s)
}

export function parseHtmlToWechat(
  source: string,
  themeId: ThemeId = DEFAULT_THEME_ID,
): string {
  if (typeof window === "undefined") return source
  const theme = getTheme(themeId)
  const fragment = extractBodyHtml(source)
  if (!fragment.trim()) return ""

  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body>${fragment}</body></html>`,
    "text/html",
  )
  const body = doc.body
  walk(body, theme)

  // 顶层裸文本包段落
  const out: string[] = []
  body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node.textContent || "").trim()
      if (t) out.push(renderParagraph(t, theme))
      return
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      out.push((node as Element).outerHTML)
    }
  })

  return out.join("\n")
}
