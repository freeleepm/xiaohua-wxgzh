import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import {
  SITE_DESCRIPTION,
  SITE_FEATURES,
  SITE_FAQ,
  SITE_FRIEND_LINKS,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_NAME_SHORT,
  SITE_ORG,
  SITE_ORG_URL,
  SITE_REPO,
  SITE_TAGLINE,
  getSiteUrl,
} from "@/lib/site-config"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const siteUrl = getSiteUrl()

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF7ED" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1917" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME_SHORT}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: SITE_NAME_SHORT, url: SITE_REPO }],
  creator: SITE_NAME_SHORT,
  publisher: SITE_NAME_SHORT,
  category: "productivity",
  classification: "Markdown to WeChat Official Account HTML converter",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: `${SITE_TAGLINE}。${SITE_DESCRIPTION}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: `${SITE_TAGLINE}。${SITE_DESCRIPTION}`,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "zh-CN",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: SITE_ORG,
      url: SITE_ORG_URL,
      sameAs: [SITE_ORG_URL, SITE_REPO],
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#app`,
      name: SITE_NAME,
      url: siteUrl,
      description: SITE_DESCRIPTION,
      applicationCategory: "BrowserApplication",
      applicationSubCategory: "Markdown editor / WeChat typesetting",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript and HTML5",
      inLanguage: "zh-CN",
      isAccessibleForFree: true,
      provider: { "@id": `${siteUrl}/#organization` },
      publisher: { "@id": `${siteUrl}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "CNY",
      },
      featureList: [...SITE_FEATURES],
      screenshot: `${siteUrl}/opengraph-image`,
      codeRepository: SITE_REPO,
      softwareHelp: {
        "@type": "WebPage",
        url: SITE_ORG_URL,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: SITE_FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
    {
      "@type": "HowTo",
      name: "如何用 Markdown 排版并复制到微信公众号",
      description: `使用${SITE_NAME}，将 Markdown 转为可粘贴进微信图文编辑器的带样式内容。`,
      inLanguage: "zh-CN",
      totalTime: "PT2M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "输入 Markdown",
          text: "在左侧编辑区粘贴或编写 Markdown，也可载入示例文稿。",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "选择主题并预览",
          text: "在右侧微信预览中切换主题，确认标题、引用、代码块等版式。",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "复制到公众号",
          text: "点击「复制到公众号」，打开微信公众平台图文编辑器直接粘贴。",
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          // 结构化数据：搜索引擎与大模型可解析产品/FAQ/操作步骤
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        {/* 百度统计：统计站点访问与使用频率 */}
        <Script id="baidu-analytics" strategy="afterInteractive">{`
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?11ce6de9cb10cbf44255112fb21150ce";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
        `}</Script>
      </body>
    </html>
  )
}
