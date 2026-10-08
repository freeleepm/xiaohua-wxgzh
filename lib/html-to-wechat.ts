/**
 * 外部 HTML → 微信可粘贴 HTML
 *
 * HTML 文稿通常自带主题（style 标签 / 内联样式 / class）。
 * 默认 policy=preserve：先把 CSS 内联进元素，再做微信兼容，尽量不改观感。
 * policy=restyle：对「无样式」节点套用本站主题（适合裸 HTML）。
 */

import {
  DEFAULT_THEME_ID,
  getTheme,
  type ThemeId,
  type WechatTheme,
} from "./wechat-themes"
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

/** 保留原文主题 | 强制套用站点主题 */
export type HtmlStylePolicy = "preserve" | "restyle"

export const HTML_STYLE_POLICY_KEY = "md2wx-html-style-policy"

export const isHtmlStylePolicy = (v: string): v is HtmlStylePolicy =>
  v === "preserve" || v === "restyle"

const DROP_TAGS = new Set([
  "script",
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
  "canvas",
  "video",
  "audio",
  "template",
])

const BLOCK_HEADING = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])

// ── style 工具 ──────────────────────────────────────────────────

const parseDecls = (css: string): Map<string, string> => {
  const map = new Map<string, string>()
  css.split(";").forEach((chunk) => {
    const i = chunk.indexOf(":")
    if (i <= 0) return
    const key = chunk.slice(0, i).trim().toLowerCase()
    const val = chunk.slice(i + 1).trim()
    if (!key || !val) return
    map.set(key, val)
  })
  return map
}

const declsToString = (map: Map<string, string>) =>
  Array.from(map.entries())
    .map(([k, v]) => `${k}:${v}`)
    .join(";")

const sanitizeCss = (css: string) =>
  css
    .replace(/expression\s*\(/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/-moz-binding\s*:/gi, "")
    .replace(/behavior\s*:/gi, "")
    .replace(/display\s*:\s*flex\b/gi, "display:block")
    .replace(/display\s*:\s*inline-flex\b/gi, "display:inline-block")
    .replace(/display\s*:\s*grid\b/gi, "display:block")
    .replace(/display\s*:\s*inline-grid\b/gi, "display:inline-block")
    .replace(/gap\s*:[^;]+;?/gi, "")
    .replace(/grid-[a-z-]*\s*:[^;]+;?/gi, "")
    .replace(/flex(-[a-z]+)?\s*:[^;]+;?/gi, "")
    .replace(/place-items\s*:[^;]+;?/gi, "")
    .replace(/place-content\s*:[^;]+;?/gi, "")

const mergeDecls = (
  el: Element,
  extra: string,
  mode: "prefer-existing" | "prefer-extra" = "prefer-extra",
) => {
  const base = parseDecls(el.getAttribute("style") || "")
  const add = parseDecls(sanitizeCss(extra))
  if (mode === "prefer-existing") {
    add.forEach((v, k) => {
      if (!base.has(k)) base.set(k, v)
    })
  } else {
    add.forEach((v, k) => base.set(k, v))
  }
  const next = declsToString(base)
  if (next) el.setAttribute("style", next)
  else el.removeAttribute("style")
}

const hasDecl = (el: Element, prop: string) =>
  parseDecls(el.getAttribute("style") || "").has(prop.toLowerCase())

const hasAnyStyle = (el: Element) => {
  const s = (el.getAttribute("style") || "").trim()
  if (s.length > 0) return true
  // class 往往对应自定义主题，内联后仍可能空，但 restyle 时更谨慎
  return (el.getAttribute("class") || "").trim().length > 0
}

const stripDangerousAttrs = (el: Element) => {
  const remove: string[] = []
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase()
    if (name.startsWith("on") || name === "srcdoc") remove.push(attr.name)
    if (
      (name === "href" || name === "src") &&
      /^\s*javascript:/i.test(attr.value)
    ) {
      remove.push(attr.name)
    }
  }
  remove.forEach((n) => el.removeAttribute(n))
}

const replaceWithHtml = (el: Element, html: string) => {
  const wrap = el.ownerDocument!.createElement("section")
  wrap.innerHTML = html
  const parent = el.parentNode
  if (!parent) return
  while (wrap.firstChild) parent.insertBefore(wrap.firstChild, el)
  parent.removeChild(el)
}

const textOf = (el: Element) => (el.textContent || "").replace(/\s+/g, " ").trim()
const innerKeep = (el: Element) => el.innerHTML

// ── 把 <style> 规则内联到元素（支持自定义主题 class）────────────

const stripCssComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "")

/** 去掉 @media / @keyframes 等 at-rule 块，保留普通规则 */
const stripAtRules = (css: string) => {
  let out = ""
  let i = 0
  while (i < css.length) {
    if (css[i] === "@") {
      // 跳到匹配大括号结束
      const start = i
      while (i < css.length && css[i] !== "{") i++
      if (i >= css.length) break
      let depth = 0
      for (; i < css.length; i++) {
        if (css[i] === "{") depth++
        else if (css[i] === "}") {
          depth--
          if (depth === 0) {
            i++
            break
          }
        }
      }
      void start
      continue
    }
    out += css[i]
    i++
  }
  return out
}

type CssRule = { selector: string; body: string }

const parseCssRules = (css: string): CssRule[] => {
  const cleaned = stripAtRules(stripCssComments(css))
  const rules: CssRule[] = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(cleaned))) {
    const selectors = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const body = m[2].trim()
    if (!body) continue
    for (const selector of selectors) {
      // 跳过伪元素 / 复杂不支持的
      if (selector.includes("::") || selector.includes("@")) continue
      rules.push({ selector, body })
    }
  }
  return rules
}

/**
 * 将文档内 style 标签规则写入匹配元素的 style 属性。
 * 后出现的规则覆盖同名属性（简化级联）。
 */
const inlineDocumentStyles = (doc: Document, root: Element) => {
  const chunks: string[] = []
  doc.querySelectorAll("style").forEach((node) => {
    chunks.push(node.textContent || "")
  })
  // body/html 上的 style 也并入根
  const bodyStyle = doc.body?.getAttribute("style")
  if (bodyStyle) mergeDecls(root, bodyStyle, "prefer-extra")

  const rules = parseCssRules(chunks.join("\n"))
  for (const rule of rules) {
    let nodes: NodeListOf<Element>
    try {
      nodes = root.querySelectorAll(rule.selector)
    } catch {
      // 非法 selector 忽略
      continue
    }
    nodes.forEach((el) => mergeDecls(el, rule.body, "prefer-extra"))
  }
}

// ── 微信兼容 ────────────────────────────────────────────────────

const convertDivToSection = (root: Element) => {
  const divs = Array.from(root.querySelectorAll("div"))
  for (const div of divs) {
    const section = root.ownerDocument!.createElement("section")
    for (const attr of Array.from(div.attributes)) {
      section.setAttribute(attr.name, attr.value)
    }
    while (div.firstChild) section.appendChild(div.firstChild)
    div.parentNode?.replaceChild(section, div)
  }
}

const ensureWechatBasics = (el: Element) => {
  const tag = el.tagName.toLowerCase()
  const st = el.getAttribute("style")
  if (st) el.setAttribute("style", sanitizeCss(st))

  // 图片兜底，不覆盖已有 max-width
  if (tag === "img") {
    mergeDecls(
      el,
      "max-width:100%;height:auto;display:block;",
      "prefer-existing",
    )
  }
}

/** 仅在 restyle 且节点几乎无样式时，套用站点主题 */
const applyAppThemeIfBare = (el: Element, theme: WechatTheme) => {
  const tag = el.tagName.toLowerCase()
  const styled = hasAnyStyle(el)

  if (tag === "hr" && !styled) {
    replaceWithHtml(el, renderHr(theme))
    return
  }

  if (BLOCK_HEADING.has(tag) && !styled) {
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

  if (tag === "blockquote" && !styled) {
    replaceWithHtml(el, renderQuote(innerKeep(el), theme))
    return
  }

  if (tag === "p" && !styled) {
    const body = innerKeep(el)
    if (!body.trim()) return
    replaceWithHtml(el, renderParagraph(body, theme))
    return
  }

  if (tag === "a" && !hasDecl(el, "color")) {
    mergeDecls(
      el,
      `color:${theme.link};text-decoration:none;border-bottom:1px solid ${theme.linkBorder};`,
      "prefer-existing",
    )
    return
  }

  if ((tag === "strong" || tag === "b") && !styled) {
    mergeDecls(el, `font-weight:700;color:${theme.bold};`, "prefer-existing")
    return
  }

  if ((tag === "em" || tag === "i") && !styled) {
    mergeDecls(el, `font-style:italic;color:${theme.italic};`, "prefer-existing")
    return
  }

  if (
    tag === "code" &&
    el.parentElement?.tagName.toLowerCase() !== "pre" &&
    !styled
  ) {
    replaceWithHtml(el, renderInlineCode(textOf(el), theme))
    return
  }

  if (tag === "pre" && !styled) {
    const code = el.querySelector("code")
    const raw = (code?.textContent || el.textContent || "").replace(/\n$/, "")
    const escaped = raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
    replaceWithHtml(
      el,
      `<section style="margin:16px 0;background:#1a1a1a;border-radius:8px;overflow:hidden;">` +
        `<section style="padding:14px 16px;overflow:auto;">` +
        `<span style="display:block;white-space:pre;font-family:Menlo,Consolas,monospace;` +
        `font-size:13px;line-height:1.6;color:#abb2bf;">${escaped}</span>` +
        `</section></section>`,
    )
    return
  }

  if (tag === "table" && !styled) {
    mergeDecls(
      el,
      `border-collapse:collapse;width:100%;margin:14px 0;font-size:14px;color:${theme.text};`,
      "prefer-existing",
    )
    return
  }

  if ((tag === "th" || tag === "td") && !styled) {
    mergeDecls(
      el,
      `border:1px solid ${theme.table.border};padding:8px 10px;` +
        (tag === "th"
          ? `background:${theme.table.headBg};color:${theme.table.headColor};font-weight:600;`
          : `color:${theme.table.cell};`),
      "prefer-existing",
    )
    return
  }

  if (tag === "li" && !hasDecl(el, "color") && !hasDecl(el, "line-height")) {
    mergeDecls(
      el,
      `margin:6px 0;line-height:1.75;color:${theme.text};`,
      "prefer-existing",
    )
  }

  if ((tag === "ul" || tag === "ol") && !styled) {
    mergeDecls(el, "margin:10px 0 10px 1.2em;padding:0;", "prefer-existing")
  }
}

/** preserve：几乎不改外观，只做兼容 */
const applyPreservePass = (el: Element) => {
  ensureWechatBasics(el)
}

const walk = (
  root: Element,
  theme: WechatTheme,
  policy: HtmlStylePolicy,
) => {
  // 1) 危险标签（style 先保留，内联后再删）
  Array.from(root.querySelectorAll("*")).forEach((el) => {
    const tag = el.tagName.toLowerCase()
    if (DROP_TAGS.has(tag)) el.remove()
    else stripDangerousAttrs(el)
  })

  // 2) 自定义主题：style 标签 → 内联
  inlineDocumentStyles(root.ownerDocument!, root)

  // 3) 删除 style 标签（已内联）
  root.querySelectorAll("style").forEach((n) => n.remove())
  root.ownerDocument?.querySelectorAll("style").forEach((n) => n.remove())

  // 4) div → section
  convertDivToSection(root)

  // 5) 兼容 + 可选套主题
  const list = Array.from(root.querySelectorAll("*")).reverse()
  for (const el of list) {
    if (!el.isConnected) continue
    if (policy === "preserve") applyPreservePass(el)
    else {
      ensureWechatBasics(el)
      applyAppThemeIfBare(el, theme)
    }
  }

  // 清掉 class（微信用处不大，且已内联）
  root.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"))
  root.querySelectorAll("[id]").forEach((el) => {
    // 保留可能被锚点使用的 id 可去掉以减噪
    el.removeAttribute("id")
  })
}

const extractBodyHtml = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    // 保留 head 里的 style，拼到 body 前，便于内联
    const headStyles = Array.from(
      trimmed.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi),
    )
      .map((m) => `<style>${m[1]}</style>`)
      .join("")
    return headStyles + bodyMatch[1]
  }
  return trimmed
}

export const looksLikeHtml = (source: string) => {
  const s = source.trim()
  if (!s) return false
  if (/^<!doctype\s+html/i.test(s) || /^<html[\s>]/i.test(s)) return true
  const tags = s.match(/<\/?[a-zA-Z][^>]*>/g)
  if (!tags || tags.length < 2) return false
  return tags.length >= 3 || /<(p|div|section|h[1-6]|table|ul|ol|article|style)\b/i.test(s)
}

/** 是否像「自带主题」的 HTML（有 style 或大量内联） */
export const looksLikeCustomThemedHtml = (source: string) => {
  const s = source
  if (/<style[\s>]/i.test(s)) return true
  const styled = s.match(/\sstyle\s*=\s*["'][^"']+["']/gi)
  return (styled?.length ?? 0) >= 3
}

export function parseHtmlToWechat(
  source: string,
  themeId: ThemeId = DEFAULT_THEME_ID,
  policy: HtmlStylePolicy = "preserve",
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
  walk(body, theme, policy)

  const out: string[] = []
  body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node.textContent || "").trim()
      if (!t) return
      if (policy === "restyle") out.push(renderParagraph(t, theme))
      else
        out.push(
          `<p style="margin:0 0 12px;line-height:1.75;font-size:15px;">${t}</p>`,
        )
      return
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      out.push((node as Element).outerHTML)
    }
  })

  return out.join("\n")
}
