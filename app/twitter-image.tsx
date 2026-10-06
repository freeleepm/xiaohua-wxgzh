import { createSocialImage } from "@/lib/social-image"

// route segment config 必须是本文件内可静态解析的字面量（不可 re-export）
export const alt = "小华同学 AI · Markdown 公众号排版"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImage()
}
