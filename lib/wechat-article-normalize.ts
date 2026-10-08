/**
 * 微信公众号文章结构统一规范化
 *
 * 对照公众号「内容结构检测」常见项：
 * - text-align 仅 left|right|center|justify（禁 start/end 等）
 * - 过大固定 width / 危险水平偏移 → 自适应，避免溢出
 * - line-height 不得过小（多行叠字）
 * - height:0 且含文字 → 去掉
 * - div → section（微信会剥 div 背景）
 * - 去掉 !important、危险定位等
 *
 * Markdown / HTML 预览与复制前统一走这里。
 */

const ALLOWED_TEXT_ALIGN = new Set(["left", "right", "center", "justify"])

const TEXT_BLOCK_TAGS = new Set([
  "p",
  "section",
  "li",
  "td",
  "th",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "article",
  "figcaption",
])

const DROP_PROPS = new Set([
  "caret-color",
  "zoom",
  "user-select",
  "-webkit-user-select",
  "pointer-events",
  "cursor",
])

/** 公众号正文区经验上限（px） */
const CONTENT_MAX_PX = 677

type Len = { num: number; unit: string }

const parseLen = (raw: string): Len | null => {
  const v = raw.trim().toLowerCase()
  if (!v) return null
  if (v === "0") return { num: 0, unit: "px" }
  const m = v.match(/^(-?[\d.]+)(px|em|rem|%|vw|vh)?$/)
  if (!m) return null
  return { num: parseFloat(m[1]), unit: m[2] || "px" }
}

const parseDecls = (css: string): Map<string, string> => {
  const map = new Map<string, string>()
  const cleaned = css.replace(/!important/gi, "")
  cleaned.split(";").forEach((chunk) => {
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

const estimateFontPx = (map: Map<string, string>): number => {
  const fs = map.get("font-size")
  if (!fs) return 16
  const p = parseLen(fs)
  if (!p) return 16
  if (p.unit === "px") return p.num
  if (p.unit === "em" || p.unit === "rem") return p.num * 16
  if (p.unit === "%") return (p.num / 100) * 16
  return 16
}

const hasVisibleText = (el: Element): boolean => {
  const t = (el.textContent || "").replace(/[\u200b\ufeff\u00a0]/g, "").trim()
  return t.length > 0
}

/** 是否可能折行（多行检测用） */
const mayWrap = (el: Element): boolean => {
  if (!hasVisibleText(el)) return false
  const t = (el.textContent || "").replace(/\s+/g, " ").trim()
  if (t.length >= 20) return true
  if (/[\n\r]/.test(el.textContent || "")) return true
  // 中文无空格：超过约 12 字也按多行风险处理
  if (/[\u4e00-\u9fff]/.test(t) && t.length >= 12) return true
  return false
}

const isLikelyDecorativeNoText = (el: Element): boolean => {
  if (hasVisibleText(el)) return false
  const kids = Array.from(el.children)
  if (kids.length === 0) return true
  return kids.every((k) => {
    const tag = k.tagName.toLowerCase()
    return tag === "img" || tag === "br" || tag === "hr"
  })
}

/** 单行装饰点（代码块红黄绿）等：字号极小 */
const isTinyGlyph = (map: Map<string, string>) => {
  const fs = estimateFontPx(map)
  return fs > 0 && fs <= 2
}

const isFontSizeZero = (map: Map<string, string>) => {
  const fs = map.get("font-size")?.trim().toLowerCase()
  return fs === "0" || fs === "0px" || fs === "0em" || fs === "0rem"
}

const normalizeTextAlign = (map: Map<string, string>, el: Element) => {
  const raw = map.get("text-align")
  if (!raw) {
    const tag = el.tagName.toLowerCase()
    // 块级文本显式 left，避免复制时浏览器写回 start
    if (TEXT_BLOCK_TAGS.has(tag) && hasVisibleText(el)) {
      map.set("text-align", "left")
    }
    return
  }
  const ta = raw.trim().toLowerCase()
  if (ta === "start" || ta === "-webkit-left" || ta === "-moz-left") {
    map.set("text-align", "left")
    return
  }
  if (ta === "end" || ta === "-webkit-right" || ta === "-moz-right") {
    map.set("text-align", "right")
    return
  }
  if (ta === "-webkit-center" || ta === "-moz-center") {
    map.set("text-align", "center")
    return
  }
  if (ta === "match-parent" || ta === "inherit" || ta === "initial" || ta === "unset") {
    map.set("text-align", "left")
    return
  }
  if (!ALLOWED_TEXT_ALIGN.has(ta)) {
    map.delete("text-align")
    if (TEXT_BLOCK_TAGS.has(el.tagName.toLowerCase()) && hasVisibleText(el)) {
      map.set("text-align", "left")
    }
  }
}

/**
 * 固定宽度过大 → 自适应，避免手机端溢出
 */
const normalizeWidth = (map: Map<string, string>, tag: string) => {
  const fixLarge = (prop: string) => {
    const v = map.get(prop)
    if (!v) return
    const low = v.toLowerCase().trim()

    if (low.includes("vw")) {
      if (prop === "width") {
        map.set("width", "100%")
        map.set("max-width", "100%")
        map.set("box-sizing", "border-box")
      } else {
        map.delete(prop)
      }
      return
    }

    const p = parseLen(v)
    if (!p) return

    if (p.unit === "px" && p.num > CONTENT_MAX_PX) {
      if (prop === "width" || prop === "min-width") {
        map.delete(prop)
        map.set("max-width", "100%")
        map.set("box-sizing", "border-box")
      }
    }
    if (p.unit === "%" && p.num > 100) {
      map.set(prop, "100%")
    }
  }

  fixLarge("width")
  fixLarge("min-width")

  const maxW = map.get("max-width")
  if (maxW) {
    const p = parseLen(maxW)
    if (p?.unit === "px" && p.num > CONTENT_MAX_PX) map.set("max-width", "100%")
  }

  if (tag === "table" || tag === "img") {
    if (!map.has("max-width")) map.set("max-width", "100%")
    map.set("box-sizing", "border-box")
    if (tag === "img" && !map.has("height")) {
      // height:auto 避免被固定高度压扁
    }
    if (tag === "img") {
      map.set("height", "auto")
    }
  }

  // 危险水平偏移
  for (const key of [
    "margin-left",
    "margin-right",
    "left",
    "right",
    "padding-left",
    "padding-right",
  ] as const) {
    const v = map.get(key)
    if (!v) continue
    const p = parseLen(v)
    if (!p || p.unit !== "px") continue
    if (key === "left" || key === "right") {
      if (Math.abs(p.num) > 24) map.delete(key)
    } else if (Math.abs(p.num) > 48) {
      map.set(key, p.num > 0 ? "16px" : "0")
    }
  }

  const tf = map.get("transform")
  if (tf && /translate[^)]{0,40}-?\d{3,}px/i.test(tf)) {
    map.delete("transform")
  }
}

const normalizeLineHeight = (map: Map<string, string>, el: Element) => {
  if (isTinyGlyph(map) || isFontSizeZero(map)) return
  if (isLikelyDecorativeNoText(el)) return

  const lh = map.get("line-height")
  const fontPx = estimateFontPx(map)
  const multi = mayWrap(el)

  if (!lh) {
    const tag = el.tagName.toLowerCase()
    if (
      hasVisibleText(el) &&
      (TEXT_BLOCK_TAGS.has(tag) || tag === "span")
    ) {
      // 块级补安全行高；多行 span 也补
      if (TEXT_BLOCK_TAGS.has(tag) || multi) {
        map.set("line-height", "1.6")
      }
    }
    return
  }

  const low = lh.trim().toLowerCase()

  if (low === "0" || low === "0px" || low === "0%" || low === "normal") {
    // normal 在各端不一致；有字时写死
    if (hasVisibleText(el)) map.set("line-height", "1.6")
    return
  }

  // 无单位倍数
  if (/^[\d.]+$/.test(low)) {
    const n = parseFloat(low)
    // 多行且 < 1.5 偏紧，统一抬到 1.6；任意有字 < 1.2 必改
    if (n > 0 && hasVisibleText(el)) {
      if (n < 1.2 || (multi && n < 1.5)) {
        map.set("line-height", "1.6")
      }
    }
    return
  }

  const p = parseLen(low)
  if (!p) return

  if (p.unit === "px") {
    // 行高 px < 字号 → 必改；多行时 < 字号 * 1.5 也改
    if (p.num > 0 && hasVisibleText(el)) {
      if (p.num < fontPx || (multi && p.num < fontPx * 1.5)) {
        map.set("line-height", "1.6")
      }
    }
    return
  }

  if (p.unit === "%" && hasVisibleText(el)) {
    if (p.num < 120 || (multi && p.num < 150)) {
      map.set("line-height", "1.6")
    }
  }

  if ((p.unit === "em" || p.unit === "rem") && hasVisibleText(el)) {
    if (p.num < 1.2 || (multi && p.num < 1.5)) {
      map.set("line-height", "1.6")
    }
  }
}

const normalizeHeight = (map: Map<string, string>, el: Element) => {
  const h = map.get("height")
  if (!h) return
  const low = h.trim().toLowerCase()
  const text = hasVisibleText(el)

  if ((low === "0" || low === "0px" || low === "0%") && text) {
    map.delete("height")
    map.delete("max-height")
    return
  }

  const p = parseLen(low)
  // 固定小高度 + 有文字 → 易裁切
  if (text && p?.unit === "px" && p.num > 0 && p.num < 48 && mayWrap(el)) {
    map.delete("height")
    map.delete("max-height")
  }
}

const normalizeWhiteSpace = (
  map: Map<string, string>,
  tag: string,
  el: Element,
) => {
  const ws = map.get("white-space")?.toLowerCase()

  const softPre = () => {
    map.set("white-space", "pre-wrap")
    map.set("word-break", "break-word")
    map.set("overflow-wrap", "break-word")
    map.set("max-width", "100%")
    map.set("box-sizing", "border-box")
  }

  if (!ws) {
    if (tag === "pre") softPre()
    return
  }

  // 代码块常写在 span 上：pre → pre-wrap，保留换行但避免横向撑破
  if (ws === "pre") {
    softPre()
    return
  }

  if (ws === "nowrap" && tag !== "code") {
    if (mayWrap(el)) {
      map.set("white-space", "normal")
      map.set("word-break", "break-word")
      map.set("overflow-wrap", "break-word")
    }
  }

  if (tag === "pre") softPre()
}

const normalizeOpacity = (map: Map<string, string>, tag: string) => {
  if (tag !== "img") return
  const op = map.get("opacity")
  if (!op) return
  const n = parseFloat(op)
  if (!Number.isNaN(n) && n <= 0) map.delete("opacity")
}

const normalizeElementStyle = (el: Element) => {
  const tag = el.tagName.toLowerCase()
  const raw = el.getAttribute("style")

  if (!raw || !raw.trim()) {
    if (tag === "pre") {
      el.setAttribute(
        "style",
        "max-width:100%;overflow-x:auto;box-sizing:border-box;white-space:pre-wrap;word-break:break-word",
      )
    }
    if (tag === "img") {
      el.setAttribute(
        "style",
        "max-width:100%;height:auto;display:block;box-sizing:border-box",
      )
    }
    if (tag === "table") {
      el.setAttribute(
        "style",
        "width:100%;max-width:100%;border-collapse:collapse;box-sizing:border-box",
      )
    }
    if (TEXT_BLOCK_TAGS.has(tag) && hasVisibleText(el)) {
      el.setAttribute("style", "text-align:left;line-height:1.6")
    }
    return
  }

  const map = parseDecls(raw)
  DROP_PROPS.forEach((p) => map.delete(p))

  normalizeTextAlign(map, el)
  normalizeWidth(map, tag)
  normalizeLineHeight(map, el)
  normalizeHeight(map, el)
  normalizeWhiteSpace(map, tag, el)
  normalizeOpacity(map, tag)

  const pos = map.get("position")?.toLowerCase()
  if (pos === "absolute" || pos === "fixed") {
    if (hasVisibleText(el) && !isTinyGlyph(map) && !isFontSizeZero(map)) {
      map.set("position", "relative")
      map.delete("left")
      map.delete("right")
      map.delete("top")
      map.delete("bottom")
    }
  }

  // 展示类 nowrap 易横向溢出
  if (map.get("display") === "inline-block" && map.get("white-space") === "nowrap") {
    if (mayWrap(el)) {
      map.set("white-space", "normal")
      map.set("word-break", "break-word")
    }
  }

  const next = declsToString(map)
  if (next) el.setAttribute("style", next)
  else el.removeAttribute("style")
}

/** div → section，保留属性与子节点 */
const convertDivToSection = (root: Element) => {
  const divs = Array.from(root.querySelectorAll("div"))
  // 从深到浅替换
  divs.reverse()
  for (const div of divs) {
    const doc = div.ownerDocument
    if (!doc) continue
    const section = doc.createElement("section")
    for (const attr of Array.from(div.attributes)) {
      section.setAttribute(attr.name, attr.value)
    }
    while (div.firstChild) section.appendChild(div.firstChild)
    div.parentNode?.replaceChild(section, div)
  }
}

/** 过深同构 section 压平 */
const flattenDeepSections = (root: Element) => {
  const MAX = 8
  const walk = (el: Element, depth: number) => {
    Array.from(el.children).forEach((c) => walk(c, depth + 1))
    if (depth <= MAX) return
    if (el.tagName.toLowerCase() !== "section") return
    if (el.childElementCount !== 1) return
    const only = el.firstElementChild
    if (!only || only.tagName.toLowerCase() !== "section") return
    const parent = el.parentElement
    if (!parent) return
    const st = el.getAttribute("style")
    if (st) {
      const childSt = only.getAttribute("style") || ""
      only.setAttribute("style", `${st};${childSt}`)
    }
    parent.replaceChild(only, el)
  }
  walk(root, 0)
}

/**
 * 对即将粘贴到公众号的 HTML 做结构/样式规范化
 */
export function normalizeWechatArticleHtml(html: string): string {
  if (typeof window === "undefined") return html
  if (!html.trim()) return ""

  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body>${html}</body></html>`,
    "text/html",
  )
  const body = doc.body

  convertDivToSection(body)

  Array.from(body.querySelectorAll("*")).forEach((el) => {
    normalizeElementStyle(el)
  })

  flattenDeepSections(body)

  Array.from(body.querySelectorAll("*")).forEach((el) => {
    normalizeElementStyle(el)
  })

  return Array.from(body.childNodes)
    .map((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) return (n as Element).outerHTML
      if (n.nodeType === Node.TEXT_NODE) {
        const t = (n.textContent || "").trim()
        return t
          ? `<p style="margin:0 0 12px;line-height:1.6;font-size:15px;text-align:left">${t}</p>`
          : ""
      }
      return ""
    })
    .filter(Boolean)
    .join("\n")
}

/** 纯文本备用（剪贴板 text/plain） */
export function wechatHtmlToPlainText(html: string): string {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  }
  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body>${html}</body></html>`,
    "text/html",
  )
  return (doc.body.textContent || "").replace(/\s+\n/g, "\n").trim()
}

/**
 * 复制到公众号：优先写规范化 HTML 字符串，避免 execCommand 把
 * text-align:start 等计算样式写回剪贴板。
 */
export async function copyWechatRichHtml(html: string): Promise<void> {
  const safe = normalizeWechatArticleHtml(html)
  const plain = wechatHtmlToPlainText(safe)

  // 1) Clipboard API：内容完全可控
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      const item = new ClipboardItem({
        "text/html": new Blob([safe], { type: "text/html" }),
        "text/plain": new Blob([plain || " "], { type: "text/plain" }),
      })
      await navigator.clipboard.write([item])
      return
    } catch {
      // fall through
    }
  }

  // 2) execCommand 兜底：插入前已规范化，容器不设会污染的继承样式
  const container = document.createElement("div")
  container.setAttribute(
    "style",
    "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;overflow:hidden",
  )
  container.innerHTML = safe
  // 再扫一遍子节点，防止序列化前被改
  Array.from(container.querySelectorAll("*")).forEach((el) => {
    const st = el.getAttribute("style") || ""
    if (/text-align\s*:\s*start/i.test(st)) {
      el.setAttribute("style", st.replace(/text-align\s*:\s*start/gi, "text-align:left"))
    }
    if (/text-align\s*:\s*end/i.test(st)) {
      el.setAttribute("style", st.replace(/text-align\s*:\s*end/gi, "text-align:right"))
    }
  })
  document.body.appendChild(container)

  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(container)
  selection?.removeAllRanges()
  selection?.addRange(range)

  const ok = document.execCommand("copy")
  selection?.removeAllRanges()
  document.body.removeChild(container)

  if (!ok) {
    // 最后：至少复制 HTML 源码
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(safe)
      return
    }
    throw new Error("copy failed")
  }
}
