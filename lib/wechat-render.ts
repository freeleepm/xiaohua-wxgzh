/**
 * 主题 → 微信兼容 HTML
 *
 * 约束：背景色用 section；横排用 float；样式全部 inline。
 * 每种 kind 是不同结构，不是换色。
 */

import type { WechatTheme } from "./wechat-themes"

const headingFamily = (theme: WechatTheme) => `font-family:${theme.headingFont};`
const bodyFamily = (theme: WechatTheme) => `font-family:${theme.font};`

// ── H1：7 套各一种结构 ──────────────────────────────────────────

const h1 = {
  band: (text: string, theme: WechatTheme) =>
    `<section style="margin:10px 0 28px;background:${theme.h1.bg};` +
    `border-radius:10px;padding:22px 24px;">` +
    `<span style="font-size:26px;font-weight:800;color:${theme.h1.color};letter-spacing:-0.5px;` +
    `line-height:1.3;display:block;${headingFamily(theme)}">${text}</span>` +
    `</section>`,

  "split-bar": (text: string, theme: WechatTheme) =>
    `<section style="margin:10px 0 28px;overflow:hidden;">` +
    `<section style="background:${theme.h1.accent};height:3px;font-size:0;line-height:0;">&#8203;</section>` +
    `<section style="background:${theme.h1.bg};padding:20px 24px 22px;">` +
    (theme.h1.kicker
      ? `<span style="display:block;font-size:11px;letter-spacing:0.22em;color:${theme.h1.accent};` +
        `margin-bottom:8px;font-weight:600;${headingFamily(theme)}">${theme.h1.kicker}</span>`
      : "") +
    `<span style="font-size:24px;font-weight:800;color:${theme.h1.color};letter-spacing:0.06em;` +
    `line-height:1.35;display:block;${headingFamily(theme)}">${text}</span>` +
    `</section></section>`,

  flag: (text: string, theme: WechatTheme) =>
    `<section style="margin:10px 0 28px;overflow:hidden;background:${theme.h1.bg};">` +
    `<span style="display:block;float:left;width:6px;background:${theme.h1.accent};` +
    `min-height:88px;margin-right:18px;">&#8203;</span>` +
    `<section style="overflow:hidden;padding:18px 18px 18px 0;">` +
    (theme.h1.kicker
      ? `<span style="display:block;font-size:11px;letter-spacing:0.18em;color:${theme.h1.accent};` +
        `margin-bottom:6px;font-weight:700;${headingFamily(theme)}">${theme.h1.kicker}</span>`
      : "") +
    `<span style="font-size:24px;font-weight:800;color:${theme.h1.color};line-height:1.35;` +
    `display:block;${headingFamily(theme)}">${text}</span>` +
    `</section></section>`,

  ruled: (text: string, theme: WechatTheme) =>
    `<section style="margin:12px 0 28px;">` +
    (theme.h1.kicker
      ? `<span style="display:block;font-size:11px;letter-spacing:0.2em;color:${theme.h1.accent};` +
        `margin-bottom:8px;font-weight:700;${headingFamily(theme)}">${theme.h1.kicker}</span>`
      : "") +
    `<span style="display:block;font-size:26px;font-weight:800;color:${theme.h1.color};` +
    `line-height:1.3;padding-bottom:12px;` +
    `background-image:linear-gradient(${theme.h1.accent},${theme.h1.accent});` +
    `background-repeat:no-repeat;background-position:left bottom;background-size:72px 4px;` +
    `${headingFamily(theme)}">${text}</span>` +
    `</section>`,

  blossom: (text: string, theme: WechatTheme) =>
    `<section style="margin:12px 0 28px;text-align:center;background:${theme.h1.bg};padding:22px 16px;">` +
    `<span style="display:block;color:${theme.h1.accent};font-size:12px;letter-spacing:0.4em;margin-bottom:10px;">◆</span>` +
    `<span style="display:block;font-size:24px;font-weight:700;color:${theme.h1.color};` +
    `letter-spacing:0.12em;line-height:1.45;${headingFamily(theme)}">${text}</span>` +
    `<span style="display:block;color:${theme.h1.accent};font-size:12px;letter-spacing:0.4em;margin-top:10px;">◆</span>` +
    `</section>`,

  "serif-center": (text: string, theme: WechatTheme) =>
    `<section style="margin:18px 0 28px;text-align:center;">` +
    `<span style="display:block;height:1px;width:48px;margin:0 auto 16px;` +
    `background:${theme.h1.accent};font-size:0;line-height:0;">&#8203;</span>` +
    `<span style="font-size:28px;font-weight:700;color:${theme.h1.color};letter-spacing:0.12em;` +
    `line-height:1.45;display:block;${headingFamily(theme)}">${text}</span>` +
    `<span style="display:block;height:1px;width:48px;margin:16px auto 0;` +
    `background:${theme.h1.accent};font-size:0;line-height:0;">&#8203;</span>` +
    `</section>`,

  bar: (text: string, theme: WechatTheme) =>
    `<section style="margin:12px 0 26px;overflow:hidden;">` +
    `<span style="display:block;float:left;width:4px;height:32px;background:${theme.h1.accent};` +
    `margin-right:14px;border-radius:2px;"></span>` +
    `<span style="display:block;overflow:hidden;font-size:26px;font-weight:800;color:${theme.h1.color};` +
    `letter-spacing:-0.4px;line-height:1.3;${headingFamily(theme)}">${text}</span>` +
    `</section>`,
}

// ── H2 ────────────────────────────────────────────────────────────

const h2 = {
  "center-line": (text: string, theme: WechatTheme) =>
    `<section style="margin:32px 0 14px;text-align:center;">` +
    `<span style="display:inline-block;padding:0 4px 10px;` +
    `background-image:linear-gradient(to right,transparent,${theme.h2.accent} 20%,${theme.h2.accent} 80%,transparent);` +
    `background-repeat:no-repeat;background-position:bottom left;background-size:100% 1px;` +
    `font-size:18px;font-weight:700;color:${theme.h2.color};line-height:1.4;` +
    `${headingFamily(theme)}">${text}</span>` +
    `</section>`,

  bar: (text: string, theme: WechatTheme) =>
    `<section style="margin:32px 0 14px;overflow:hidden;">` +
    `<span style="display:block;float:left;width:4px;height:22px;background:${theme.h2.accent};` +
    `margin-right:12px;border-radius:2px;margin-top:2px;"></span>` +
    `<span style="display:block;overflow:hidden;font-size:18px;font-weight:700;color:${theme.h2.color};` +
    `line-height:1.4;${headingFamily(theme)}">${text}</span>` +
    `</section>`,

  index: (text: string, theme: WechatTheme) =>
    `<section style="margin:32px 0 14px;overflow:hidden;">` +
    `<span style="display:block;float:left;min-width:28px;height:22px;background:${theme.h2.accent};` +
    `color:#fff;font-size:11px;font-weight:700;line-height:22px;text-align:center;` +
    `margin-right:10px;letter-spacing:0.04em;">§</span>` +
    `<span style="display:block;overflow:hidden;font-size:18px;font-weight:700;color:${theme.h2.color};` +
    `line-height:1.4;${headingFamily(theme)}">${text}</span>` +
    `</section>`,

  ruled: (text: string, theme: WechatTheme) =>
    `<section style="margin:32px 0 14px;">` +
    `<span style="display:inline-block;padding-bottom:8px;font-size:18px;font-weight:700;` +
    `color:${theme.h2.color};line-height:1.4;` +
    `background-image:linear-gradient(${theme.h2.accent},${theme.h2.accent});` +
    `background-repeat:no-repeat;background-position:left bottom;background-size:100% 2px;` +
    `${headingFamily(theme)}">${text}</span>` +
    `</section>`,

  ornament: (text: string, theme: WechatTheme) =>
    `<section style="margin:32px 0 14px;text-align:center;">` +
    `<span style="display:inline-block;font-size:18px;font-weight:700;color:${theme.h2.color};` +
    `line-height:1.5;letter-spacing:0.06em;${headingFamily(theme)}">` +
    `<span style="color:${theme.h2.accent};margin-right:8px;font-weight:400;">&#12300;</span>` +
    `${text}` +
    `<span style="color:${theme.h2.accent};margin-left:8px;font-weight:400;">&#12301;</span>` +
    `</span></section>`,

  dash: (text: string, theme: WechatTheme) =>
    `<section style="margin:32px 0 14px;text-align:center;">` +
    `<span style="font-size:18px;font-weight:700;color:${theme.h2.color};letter-spacing:0.08em;` +
    `line-height:1.5;${headingFamily(theme)}">` +
    `<span style="color:${theme.h2.accent};margin-right:10px;font-weight:400;">—</span>` +
    `${text}` +
    `<span style="color:${theme.h2.accent};margin-left:10px;font-weight:400;">—</span>` +
    `</span></section>`,

  plain: (text: string, theme: WechatTheme) =>
    `<div style="margin:28px 0 12px;">` +
    `<span style="font-size:18px;font-weight:700;color:${theme.h2.color};display:block;` +
    `letter-spacing:0.02em;${headingFamily(theme)}">${text}</span></div>`,
}

// ── H3 ────────────────────────────────────────────────────────────

const h3 = {
  pill: (text: string, theme: WechatTheme) =>
    `<div style="margin:20px 0 10px;">` +
    `<span style="display:inline-block;padding:5px 14px;border-radius:6px;` +
    `background:${theme.h3.bg};font-size:15px;font-weight:600;color:${theme.h3.color};` +
    `line-height:1.4;${headingFamily(theme)}">${text}</span>` +
    `</div>`,

  dot: (text: string, theme: WechatTheme) =>
    `<section style="margin:20px 0 10px;overflow:hidden;">` +
    `<span style="display:block;float:left;width:8px;height:8px;background:${theme.h3.bg};` +
    `border-radius:50%;margin:8px 10px 0 0;"></span>` +
    `<span style="display:block;overflow:hidden;font-size:15px;font-weight:700;color:${theme.h3.color};` +
    `line-height:1.4;${headingFamily(theme)}">${text}</span>` +
    `</section>`,

  tag: (text: string, theme: WechatTheme) =>
    `<div style="margin:20px 0 10px;">` +
    `<span style="display:inline-block;padding:3px 10px;background:${theme.h3.bg};` +
    `font-size:13px;font-weight:700;color:${theme.h3.color};letter-spacing:0.04em;` +
    `line-height:1.5;${headingFamily(theme)}">${text}</span>` +
    `</div>`,

  kicker: (text: string, theme: WechatTheme) =>
    `<section style="margin:20px 0 10px;">` +
    `<span style="display:inline-block;width:8px;height:8px;background:${theme.h3.bg};` +
    `margin-right:8px;vertical-align:middle;"></span>` +
    `<span style="font-size:15px;font-weight:700;color:${theme.h3.color};letter-spacing:0.02em;` +
    `${headingFamily(theme)}">${text}</span>` +
    `</section>`,

  italic: (text: string, theme: WechatTheme) =>
    `<section style="margin:20px 0 10px;text-align:center;">` +
    `<span style="font-size:15px;font-weight:600;font-style:italic;color:${theme.h3.color};` +
    `letter-spacing:0.08em;line-height:1.6;${headingFamily(theme)}">${text}</span></section>`,

  plain: (text: string, theme: WechatTheme) =>
    `<section style="margin:20px 0 10px;text-align:left;">` +
    `<span style="font-size:16px;font-weight:700;color:${theme.h3.color};display:block;` +
    `letter-spacing:0.04em;line-height:1.6;${headingFamily(theme)}">${text}</span></section>`,

  hash: (text: string, theme: WechatTheme) =>
    `<section style="margin:20px 0 10px;text-align:left;">` +
    `<span style="color:${theme.h3.color};opacity:0.45;margin-right:6px;font-weight:700;">#</span>` +
    `<span style="font-size:15px;font-weight:600;color:${theme.h3.color};line-height:1.6;${headingFamily(theme)}">${text}</span>` +
    `</section>`,
}

export const renderH1 = (text: string, theme: WechatTheme) => h1[theme.h1.kind](text, theme)
export const renderH2 = (text: string, theme: WechatTheme) => h2[theme.h2.kind](text, theme)
export const renderH3 = (text: string, theme: WechatTheme) => h3[theme.h3.kind](text, theme)

export const renderH4 = (text: string, theme: WechatTheme) =>
  `<section style="margin:22px 0 8px;text-align:left;">` +
  `<span style="font-size:15px;font-weight:700;color:${theme.h4};display:block;` +
  `line-height:1.6;${headingFamily(theme)}">${text}</span></section>`

export const renderH5 = (text: string, theme: WechatTheme) =>
  `<section style="margin:18px 0 7px;text-align:left;">` +
  `<span style="font-size:13px;font-weight:600;color:${theme.h5};display:block;` +
  `line-height:1.6;${headingFamily(theme)}">${text}</span></section>`

export const renderH6 = (text: string, theme: WechatTheme) =>
  `<section style="margin:16px 0 6px;text-align:left;">` +
  `<span style="font-size:11px;font-weight:700;color:${theme.h6};letter-spacing:0.14em;` +
  `text-transform:uppercase;display:block;line-height:1.6;${headingFamily(theme)}">${text}</span></section>`

// ── 段落 / 行内 ──────────────────────────────────────────────────

export const renderParagraph = (text: string, theme: WechatTheme) => {
  const indent = theme.body.indent !== "0" ? `text-indent:${theme.body.indent};` : ""
  return (
    `<p style="margin:0 0 16px;line-height:${theme.body.line};color:${theme.text};` +
    `font-size:${theme.body.size};text-align:${theme.body.align};${indent}${bodyFamily(theme)}">${text}</p>`
  )
}

export const renderStrong = (text: string, theme: WechatTheme) =>
  `<strong style="font-weight:700;color:${theme.bold};">${text}</strong>`

export const renderEm = (text: string, theme: WechatTheme) =>
  `<em style="font-style:italic;color:${theme.italic};">${text}</em>`

export const renderStrike = (text: string, theme: WechatTheme) =>
  `<del style="color:${theme.strike};text-decoration:line-through;">${text}</del>`

export const renderLink = (text: string, href: string, theme: WechatTheme) =>
  `<a href="${href}" style="color:${theme.link};text-decoration:none;` +
  `border-bottom:1px solid ${theme.linkBorder};font-weight:500;">${text}</a>`

export const renderInlineCode = (code: string, theme: WechatTheme) =>
  `<code style="background:${theme.inlineCode.bg};color:${theme.inlineCode.color};border-radius:4px;` +
  `padding:2px 6px;font-family:'Menlo','Consolas',monospace;font-size:0.85em;` +
  `border:1px solid ${theme.inlineCode.border};">${code}</code>`

const hr = {
  fade: (theme: WechatTheme) =>
    `<section style="margin:36px 0;padding:0;line-height:0;font-size:0;">` +
    `<span style="display:block;height:1px;background:linear-gradient(to right,transparent,${theme.hr.color} 20%,${theme.hr.color} 80%,transparent);` +
    `font-size:0;line-height:0;">&#8203;</span></section>`,

  ornament: (theme: WechatTheme) =>
    `<section style="margin:36px 0;text-align:center;line-height:1;">` +
    `<span style="display:inline-block;width:36px;height:1px;background:${theme.hr.color};vertical-align:middle;"></span>` +
    `<span style="color:${theme.hr.color};margin:0 10px;font-size:10px;vertical-align:middle;">◆</span>` +
    `<span style="display:inline-block;width:36px;height:1px;background:${theme.hr.color};vertical-align:middle;"></span>` +
    `</section>`,

  short: (theme: WechatTheme) =>
    `<section style="margin:32px 0;text-align:center;line-height:0;font-size:0;">` +
    `<span style="display:inline-block;width:48px;height:2px;background:${theme.hr.color};">&#8203;</span>` +
    `</section>`,

  double: (theme: WechatTheme) =>
    `<section style="margin:36px auto;width:80px;">` +
    `<span style="display:block;height:1px;background:${theme.hr.color};margin-bottom:3px;">&#8203;</span>` +
    `<span style="display:block;height:1px;background:${theme.hr.color};">&#8203;</span>` +
    `</section>`,
}

export const renderHr = (theme: WechatTheme) => hr[theme.hr.kind](theme)

export const renderImage = (alt: string, src: string) =>
  `<section style="margin:18px 0;text-align:center;">` +
  `<img src="${src}" alt="${alt}" style="max-width:100%;height:auto;border-radius:8px;display:inline-block;box-sizing:border-box;" />` +
  `</section>`

// ── 引用 ──────────────────────────────────────────────────────────

const quote = {
  card: (content: string, theme: WechatTheme) =>
    `<section style="background:${theme.quote.bg};border-radius:8px;margin:20px 0;padding:16px 20px;` +
    `border:1px solid ${theme.quote.border};">` +
    `<p style="margin:0;color:${theme.quote.color};line-height:1.85;font-size:14.5px;font-style:italic;${bodyFamily(theme)}">` +
    `<span style="color:${theme.quote.mark};font-size:22px;line-height:0.8;vertical-align:-4px;margin-right:4px;font-style:normal;">\u201C</span>` +
    `${content}</p></section>`,

  mark: (content: string, theme: WechatTheme) =>
    `<section style="margin:22px 24px;text-align:center;">` +
    `<p style="margin:0;color:${theme.quote.color};line-height:1.9;font-size:16px;font-style:italic;${bodyFamily(theme)}">` +
    `<span style="display:block;color:${theme.quote.mark};font-size:28px;line-height:1;margin-bottom:6px;font-style:normal;">\u201C</span>` +
    `${content}</p></section>`,

  bar: (content: string, theme: WechatTheme) =>
    `<section style="margin:20px 0;overflow:hidden;background:${theme.quote.bg};">` +
    `<span style="display:block;float:left;width:3px;background:${theme.quote.border};` +
    `min-height:48px;margin-right:14px;">&#8203;</span>` +
    `<p style="margin:14px 16px 14px 0;overflow:hidden;color:${theme.quote.color};line-height:1.85;` +
    `font-size:14.5px;font-style:italic;${bodyFamily(theme)}">${content}</p>` +
    `</section>`,

  panel: (content: string, theme: WechatTheme) =>
    `<section style="margin:20px 0;background:${theme.quote.bg};padding:18px 20px;">` +
    `<span style="display:block;height:2px;width:32px;background:${theme.quote.border};margin-bottom:12px;">&#8203;</span>` +
    `<p style="margin:0;color:${theme.quote.color};line-height:1.85;font-size:14.5px;${bodyFamily(theme)}">${content}</p>` +
    `</section>`,
}

export const renderQuote = (content: string, theme: WechatTheme) =>
  quote[theme.quote.kind](content, theme)

// ── 列表 ──────────────────────────────────────────────────────────

const LIST_MARK: Record<WechatTheme["list"]["kind"], string> = {
  dot: "●",
  square: "■",
  diamond: "◆",
  dash: "–",
  emdash: "—",
}

export const renderUlItem = (text: string, theme: WechatTheme) =>
  `<section style="margin:7px 0;line-height:1.75;">` +
  `<span style="color:${theme.bullet};font-size:${theme.list.kind === "dot" ? "8px" : "12px"};` +
  `margin-right:8px;vertical-align:middle;">${LIST_MARK[theme.list.kind]}</span>` +
  `<span style="color:${theme.text};">${text}</span></section>`

export const wrapList = (items: string) =>
  `<section style="margin:14px 0;padding-left:4px;">${items}</section>`

const olItem = {
  badge: (text: string, n: number, theme: WechatTheme) =>
    `<section style="margin:7px 0;line-height:1.75;overflow:hidden;">` +
    `<span style="display:block;float:left;min-width:22px;height:22px;background:${theme.ol.bg};color:${theme.ol.color};` +
    `border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;` +
    `margin-right:10px;">${n}</span>` +
    `<span style="display:block;overflow:hidden;color:${theme.text};">${text}</span></section>`,

  square: (text: string, n: number, theme: WechatTheme) =>
    `<section style="margin:7px 0;line-height:1.75;overflow:hidden;">` +
    `<span style="display:block;float:left;min-width:22px;height:22px;background:${theme.ol.bg};color:${theme.ol.color};` +
    `text-align:center;font-size:12px;font-weight:700;line-height:22px;margin-right:10px;">${n}</span>` +
    `<span style="display:block;overflow:hidden;color:${theme.text};">${text}</span></section>`,

  index: (text: string, n: number, theme: WechatTheme) => {
    const label = n < 10 ? `0${n}` : `${n}`
    return (
      `<section style="margin:8px 0;line-height:1.75;overflow:hidden;">` +
      `<span style="display:block;float:left;min-width:32px;font-family:Menlo,Consolas,monospace;` +
      `font-size:12px;font-weight:700;color:${theme.ol.color};letter-spacing:0.06em;margin-right:8px;">${label}</span>` +
      `<span style="display:block;overflow:hidden;color:${theme.text};">${text}</span></section>`
    )
  },

  plain: (text: string, n: number, theme: WechatTheme) =>
    `<section style="margin:7px 0;line-height:1.75;overflow:hidden;">` +
    `<span style="display:block;float:left;min-width:26px;font-weight:700;color:${theme.ol.color};` +
    `margin-right:6px;">${n}.</span>` +
    `<span style="display:block;overflow:hidden;color:${theme.text};">${text}</span></section>`,
}

export const renderOlItem = (text: string, n: number, theme: WechatTheme) =>
  olItem[theme.ol.kind](text, n, theme)

export const renderTable = (
  headerCells: string[],
  bodyRows: string[][],
  theme: WechatTheme,
) => {
  const headBorder =
    theme.table.kind === "minimal"
      ? `border-bottom:2px solid ${theme.table.border};`
      : theme.table.kind === "line"
        ? `border-bottom:2px solid ${theme.table.border};`
        : `border:1px solid ${theme.table.headBg};`

  const head = headerCells
    .map(
      (cell) =>
        `<th style="padding:10px 16px;background:${theme.table.headBg};color:${theme.table.headColor};font-weight:700;` +
        `text-align:left;font-size:14px;line-height:1.65;${headBorder}">${cell}</th>`,
    )
    .join("")

  const body = bodyRows
    .map((row, i) => {
      const bg = theme.table.stripe && i % 2 === 1 ? `background:${theme.table.stripe};` : ""
      const cells = row
        .map(
          (cell) =>
            `<td style="padding:10px 16px;border-top:1px solid ${theme.table.border};${bg}` +
            `font-size:14px;color:${theme.table.cell};line-height:1.65;">${cell}</td>`,
        )
        .join("")
      return `<tr>${cells}</tr>`
    })
    .join("")

  const tableBorder =
    theme.table.kind === "solid" ? `border:1px solid ${theme.table.border};` : ""

  return (
    `<section style="margin:22px 0;overflow:hidden;">` +
    `<table style="width:100%;border-spacing:0;${tableBorder}">` +
    `<thead><tr>${head}</tr></thead>` +
    `<tbody>${body}</tbody>` +
    `</table></section>`
  )
}
