import { ImageResponse } from "next/og"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site-config"

export const runtime = "edge"
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
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
              fontSize: 64,
              fontWeight: 760,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              maxWidth: 920,
            }}
          >
            公众号编辑器
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#7C2D12",
              lineHeight: 1.4,
              maxWidth: 880,
            }}
          >
            Markdown 实时转微信公众号排版 · 多主题 · 一键复制
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
    { ...size },
  )
}
