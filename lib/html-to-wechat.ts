/**
 * 外部 HTML → 微信可粘贴 HTML
 *
 * HTML 只走「自定义主题」：内联 style/class，做微信兼容，不套用站点主题。
 * 站点主题仅用于 Markdown 模式。
 */

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

// ── CSS 内联（自定义主题 class / style 标签）────────────────────

const stripCssComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "")

const stripAtRules = (css: string) => {
  let out = ""
  let i = 0
  while (i < css.length) {
    if (css[i] === "@") {
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
      if (selector.includes("::") || selector.includes("@")) continue
      rules.push({ selector, body })
    }
  }
  return rules
}

const inlineDocumentStyles = (doc: Document, root: Element) => {
  const chunks: string[] = []
  doc.querySelectorAll("style").forEach((node) => {
    chunks.push(node.textContent || "")
  })
  const bodyStyle = doc.body?.getAttribute("style")
  if (bodyStyle) mergeDecls(root, bodyStyle, "prefer-extra")

  for (const rule of parseCssRules(chunks.join("\n"))) {
    let nodes: NodeListOf<Element>
    try {
      nodes = root.querySelectorAll(rule.selector)
    } catch {
      continue
    }
    nodes.forEach((el) => mergeDecls(el, rule.body, "prefer-extra"))
  }
}

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
  if (tag === "img") {
    mergeDecls(
      el,
      "max-width:100%;height:auto;display:block;",
      "prefer-existing",
    )
  }
}

const walk = (root: Element) => {
  Array.from(root.querySelectorAll("*")).forEach((el) => {
    const tag = el.tagName.toLowerCase()
    if (DROP_TAGS.has(tag)) el.remove()
    else stripDangerousAttrs(el)
  })

  inlineDocumentStyles(root.ownerDocument!, root)

  root.querySelectorAll("style").forEach((n) => n.remove())
  root.ownerDocument?.querySelectorAll("style").forEach((n) => n.remove())

  convertDivToSection(root)

  Array.from(root.querySelectorAll("*")).forEach((el) => {
    if (el.isConnected) ensureWechatBasics(el)
  })

  root.querySelectorAll("[class]").forEach((el) => el.removeAttribute("class"))
  root.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"))
}

const extractBodyHtml = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
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
  return (
    tags.length >= 3 ||
    /<(p|div|section|h[1-6]|table|ul|ol|article|style)\b/i.test(s)
  )
}

/** HTML → 微信 HTML：只保留自定义样式 + 兼容处理 */
export function parseHtmlToWechat(source: string): string {
  if (typeof window === "undefined") return source
  const fragment = extractBodyHtml(source)
  if (!fragment.trim()) return ""

  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body>${fragment}</body></html>`,
    "text/html",
  )
  const body = doc.body
  walk(body)

  const out: string[] = []
  body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node.textContent || "").trim()
      if (t)
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
