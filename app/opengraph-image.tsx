import { createSocialImage } from "@/lib/social-image"

// route segment config 必须是本文件内可静态解析的字面量
export const alt = "小华同学AI公众号编辑器 — Markdown 转微信公众号排版"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImage()
}
