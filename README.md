# 小华同学 AI 公众号排版工具

**学天科技**旗下公众号工具：把 **Markdown 或 HTML** 转成微信公众号可粘贴的排版内容。左侧编辑、右侧预览，点「复制到公众号」即可带样式粘进微信图文编辑器。

纯前端单页应用，无后端、无登录；草稿自动保存在浏览器本地。

- **官方演示**：[https://wx.leepm.com](https://wx.leepm.com)（可直接在线使用）
- 出品：[学天科技](https://xuetian.ai)
- 仓库：https://github.com/freeleepm/xiaohua-wxgzh

---

## 功能一览

| 能力 | 说明 |
|------|------|
| Markdown / HTML 双模式 | 左侧可切换源码类型；HTML 粘贴后同样预览并复制到公众号 |
| 实时预览 | 输入内容即时渲染微信样式 |
| 一键复制 | 富文本复制，兼容微信图文编辑器；也可复制原始 HTML |
| 多套主题 | 小华橙、墨金、青竹、苍青、绛红、书卷等，**版式不同**而不只是换色 |
| 编辑工具栏 | Markdown 模式下：标题 / 粗斜体 / 列表 / 引用 / 链接 / 图片 / 代码 / 表格 |
| 撤销重做 | `⌘/Ctrl+Z`、`⇧⌘Z` / `Ctrl+Y`；与历史版本互不干扰 |
| 自动保存 | 停笔约 1.2s 写入当前稿；约 45s 或关页追加时间版本（最多 30 条） |
| 历史版本 | 可恢复、删除；`⌘/Ctrl+S` 立即记一笔 |
| 分屏模式 | 分屏 / 仅编辑 / 仅预览 |

### 支持的 Markdown

标题 · 段落 · 粗体 / 斜体 / 删除线 · 行内代码 · 代码块（高亮）  
引用 · 有序 / 无序列表 · 表格 · 链接 · 图片 · 分割线

### HTML 模式

粘贴完整 HTML 或片段（博客、文档导出等）。HTML **通常自带主题**：

| 策略 | 说明 |
|------|------|
| **保留原文**（默认） | 将 `<style>` / class 规则内联，尽量保留自定义配色与版式，再做微信兼容（如 `div`→`section`、弱化 flex） |
| **站点主题** | 对无样式节点套用本站主题（小华橙等），适合裸 HTML |

预览区可切换上述策略；「保留原文」时不强制站点字体，避免冲掉原文排版。

---

## 快速开始

### 环境要求

- Node.js 18+（建议 20+）
- npm / pnpm / yarn 任一

### 安装与运行

```bash
# 克隆
git clone git@github.com:freeleepm/xiaohua-wxgzh.git
cd xiaohua-wxgzh

# 安装依赖（仓库含 pnpm-lock.yaml，也可用 npm）
pnpm install
# 或: npm install

# 开发
pnpm dev
# 或: npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

### 生产构建

```bash
pnpm build && pnpm start
# 或: npm run build && npm start
```

---

## 使用说明

1. 在左侧粘贴或编写 Markdown（可点「载入示例」）
2. 右侧切换主题，确认版式与配色
3. 点右上角 **复制到公众号**
4. 打开微信公众平台图文编辑器，直接粘贴（`⌘/Ctrl+V`）

本地草稿存在 `localStorage`，刷新页面会自动恢复最近内容；历史版本可从顶栏「历史版本」找回。

---

## 技术栈

| 项 | 选型 |
|----|------|
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 + CSS 变量 |
| UI | shadcn/ui（New York） |
| 图标 | lucide-react |
| 解析 | 自研 `lib/markdown-parser.ts`（无 marked/remark） |

---

## 目录结构（核心）

```
app/                    # 页面与全局样式入口
components/
  converter-page.tsx    # 状态中心：编辑 / 预览 / 复制 / 保存
  markdown-editor.tsx   # 编辑器 + 工具栏 / 右键菜单
  wechat-preview.tsx    # 实时预览
  theme-picker.tsx      # 主题选择
  version-picker.tsx    # 历史版本
lib/
  markdown-parser.ts    # Markdown → 内联样式 HTML
  wechat-themes.ts      # 主题目录与色板
  wechat-render.ts      # 结构渲染（标题 / 列表 / 表格等）
  md-edit.ts            # 编辑插入原语
  draft-versions.ts     # 草稿与版本读写
hooks/
  use-text-history.ts   # 撤销 / 重做
  use-draft-versions.ts # 自动保存与版本快照
```

数据流：

```
Markdown 输入
    → ConverterPage
        → MarkdownEditor
        → WechatPreview → parseMarkdownToHTML(themeId)
            → 内联样式 HTML（可复制到微信）
```

---

## 微信兼容要点

修改解析 / 主题时请遵守：

1. **背景色容器用 `<section>`**，不要用 `<div>`（微信会剥掉 `div` 的 `background`）
2. **布局优先 `float`**，避免依赖 `display: flex`（粘贴后易失效）
3. **样式全部 inline**，不依赖外部 class（预览里的 class 仅辅助本地展示）
4. 代码块等复杂结构需按主题用 section + 内联样式组装

---

## 主题说明

主题定义在 `lib/wechat-themes.ts`。每套主题包含：

- 色板（正文、标题、引用、表格、链接等）
- **版式 kind**（H1/H2/H3、列表、引用、表格、分割线的结构样式）

默认主题：`xiaohua`（小华橙）。用户选择会写入 `localStorage` 键 `md2wx-wechat-theme`。

---

## 脚本命令

```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run start    # 启动生产服务
npm run lint     # ESLint
```

---

## SEO / GEO（搜索引擎与大模型发现）

已内置便于收录与引用的能力：

| 项 | 位置 | 作用 |
|----|------|------|
| 完整 Metadata | `app/layout.tsx` / `lib/site-config.ts` | title、description、keywords、canonical、robots |
| Open Graph / Twitter | 同上 + `app/opengraph-image.tsx` | 社交与部分搜索结果卡片 |
| JSON-LD | `layout.tsx` | WebSite / WebApplication / FAQ / HowTo |
| 可抓取正文 | `components/seo-content.tsx` | 对用户视觉隐藏、对爬虫可读的产品说明 |
| `robots.txt` | `app/robots.ts` | 放行搜索与常见 AI 爬虫 |
| `sitemap.xml` | `app/sitemap.ts` | 站点地图 |
| `llms.txt` | `public/llms.txt` | 给大模型 / Agent 的产品说明 |
| PWA manifest | `public/site.webmanifest` | 应用名与图标 |

部署生产域名后请设置：

```bash
# .env.local 或托管平台环境变量
NEXT_PUBLIC_SITE_URL=https://你的正式域名
```

未设置时会依次尝试 `VERCEL_PROJECT_PRODUCTION_URL`、`VERCEL_URL`，否则回退 `http://localhost:3000`。  
`metadataBase`、canonical、sitemap、结构化数据中的绝对 URL 都依赖该值。

可在搜索引擎站长平台提交：`https://你的域名/sitemap.xml`。

---

## 部署

任意支持 Next.js 的平台均可，例如：

```bash
# Vercel
npx vercel

# 或自行 Node 托管
npm run build && npm start
```

静态资源与逻辑均在前端；注意 HTTPS 与剪贴板权限，以保证「复制到公众号」可用。

建议同步配置：

```bash
NEXT_PUBLIC_SITE_URL=https://你的正式域名
```

---

## 相关说明

- `baoyu-post-to-wechat/`：可选的发布 skill / 参考实现，与本 Web 编辑器独立；日常使用本仓库根目录的 Web 应用即可。
- 草稿与版本仅存于当前浏览器，换设备或清缓存会丢失，重要文稿请自行备份 Markdown。

---

## License

Private / 未声明开源协议前，仅供小华同学 AI 相关用途使用。如需开源请补充 LICENSE。
