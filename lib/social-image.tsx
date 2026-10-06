import { ImageResponse } from "next/og"

/** OG / Twitter 共用画面；route 的 size/alt/runtime 仍须写在各自文件里 */
export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 42%, #FED7AA 100%)",
          color: "#1C1917",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 600,
            color: "#9A3412",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #EA580C, #F97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            华
          </div>
          小华同学 AI
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            公众号排版工具
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#7C2D12",
              lineHeight: 1.45,
              maxWidth: 900,
            }}
          >
            学天科技旗下 · Markdown 实时预览 · 一键复制到微信图文
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#9A3412",
          }}
        >
          <span>免费 · 免登录 · 本地自动保存</span>
          <span
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              background: "#EA580C",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            复制到公众号
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
