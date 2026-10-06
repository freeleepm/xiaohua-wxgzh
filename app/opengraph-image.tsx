import { createSocialImage } from "@/lib/social-image"

export const alt = "小华同学 AI 公众号排版工具 · 学天科技"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImage()
}
