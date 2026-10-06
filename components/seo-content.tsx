import {
  SITE_DESCRIPTION,
  SITE_FAQ,
  SITE_FEATURES,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site-config"

/**
 * 给搜索引擎 / 大模型爬虫看的静态文案。
 * 对正常用户折叠隐藏，避免占满全屏编辑器，但 HTML 源码里始终存在。
 */
export function SeoContent() {
  return (
    <section
      aria-label={`${SITE_NAME}产品说明`}
      className="sr-only"
      data-seo="primary"
    >
      <h1>
        {SITE_NAME} — {SITE_TAGLINE}
      </h1>
      <p>{SITE_DESCRIPTION}</p>

      <h2>核心功能</h2>
      <ul>
        {SITE_FEATURES.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>使用方法</h2>
      <ol>
        <li>在左侧编辑区输入或粘贴 Markdown</li>
        <li>在右侧预览微信公众号效果并切换主题</li>
        <li>点击「复制到公众号」，粘贴到微信公众平台图文编辑器</li>
      </ol>

      <h2>常见问题</h2>
      {SITE_FAQ.map((item) => (
        <div key={item.q}>
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </div>
      ))}
    </section>
  )
}
