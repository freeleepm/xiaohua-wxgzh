/**
 * 站点品牌 / SEO / GEO 共用配置
 * 部署时建议设置 NEXT_PUBLIC_SITE_URL=https://你的域名
 */

/** 品牌 */
export const SITE_BRAND = "小华同学 AI"

/** 产品定位（顶栏徽章、短名） */
export const SITE_PRODUCT = "Markdown 公众号排版"

/**
 * 完整产品名：浏览器标签、OG、结构化数据主标题
 * 例：小华同学 AI · Markdown 公众号排版
 */
export const SITE_NAME = `${SITE_BRAND} · ${SITE_PRODUCT}`

/** 短名：作者、title template */
export const SITE_NAME_SHORT = SITE_BRAND

/** 价值主张：放 description，不重复叠进 title */
export const SITE_TAGLINE = "实时预览微信图文样式，一键复制到公众号编辑器"

export const SITE_DESCRIPTION =
  `${SITE_NAME}：在线将 Markdown 转为微信公众号可粘贴的排版内容。` +
  "左侧编辑、右侧实时预览多套专业主题，一键复制富文本至微信公众平台图文编辑器。" +
  "支持标题、列表、表格、代码块与引用，浏览器本地自动保存与历史版本，无需注册。"

export const SITE_KEYWORDS = [
  "Markdown转微信公众号",
  "微信公众号排版",
  "公众号 Markdown",
  "Markdown 公众号排版",
  "微信图文编辑器",
  "Markdown转HTML",
  "公众号样式主题",
  "md2wx",
  "小华同学 AI",
  "一键复制到公众号",
  "微信排版工具",
  "公众号预览",
] as const

export const SITE_REPO = "https://github.com/freeleepm/xiaohua-wxgzh"

export const getSiteUrl = (): string => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
  if (explicit) return explicit

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProd) return `https://${vercelProd.replace(/^https?:\/\//, "")}`

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`

  return "http://localhost:3000"
}

/** 供搜索引擎与大模型理解的功能要点 */
export const SITE_FEATURES = [
  "Markdown 实时转换为微信公众号兼容 HTML",
  "多套专业版式主题（小华橙、墨金、青竹、苍青、绛红、书卷等）",
  "一键复制富文本到微信公众平台图文编辑器，样式尽量保留",
  "编辑工具栏：标题、粗斜体、列表、引用、链接、图片、代码、表格",
  "浏览器本地自动保存与历史版本恢复，无需注册登录",
  "纯前端运行，内容不上传服务器",
] as const

export const SITE_FAQ = [
  {
    q: `${SITE_NAME}是做什么的？`,
    a: "面向公众号作者的在线排版工具：用 Markdown 写作，实时预览微信图文效果，点击「复制到公众号」即可粘贴进微信公众平台图文编辑器。",
  },
  {
    q: "需要安装或注册吗？",
    a: "不需要。打开网页即可使用，草稿保存在浏览器本地，无需账号。",
  },
  {
    q: "复制后样式会丢失吗？",
    a: "工具输出内联样式 HTML，并针对微信编辑器限制做了兼容（如 section 背景、避免依赖 flex）。多数常见排版可保留，复杂布局仍建议在公众号后台微调。",
  },
  {
    q: "支持哪些 Markdown 语法？",
    a: "支持标题、段落、粗体、斜体、删除线、行内代码、代码块、引用、有序/无序列表、表格、链接、图片和分割线。",
  },
] as const
