# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

**MD2WX** — 一个将 Markdown 实时转换为微信公众号兼容 HTML 的单页工具。用户粘贴 Markdown，右侧实时预览渲染效果，点击「复制到公众号」后可直接粘贴进微信图文编辑器，样式完整保留。

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行生产服务
npm start

# 代码检查
npm run lint
```

> 本项目使用 `pnpm-lock.yaml`（但 node_modules 由 npm 生成），安装依赖时优先用 `pnpm install`，也可用 `npm install`。

## 技术栈

- **框架**：Next.js 16（App Router，单页应用，无 API Routes）
- **语言**：TypeScript（`strict: true`，但 `ignoreBuildErrors: true`）
- **样式**：Tailwind CSS v4 + CSS 自定义变量（`globals.css`）
- **UI 组件库**：shadcn/ui（New York 风格，组件位于 `components/ui/`）
- **图标**：lucide-react
- **分析**：@vercel/analytics（内嵌于 `layout.tsx`）

## 架构概览

整个应用是一个无后端的纯前端 SPA，核心数据流为：

```
用户输入 Markdown
    ↓
ConverterPage (components/converter-page.tsx)  ← 唯一状态中心
    ├── MarkdownEditor  (components/markdown-editor.tsx)   ← 简单 textarea，支持 Tab 缩进
    └── WechatPreview   (components/wechat-preview.tsx)    ← useMemo 缓存，dangerouslySetInnerHTML 渲染
             ↓
        parseMarkdownToHTML (lib/markdown-parser.ts)        ← 核心解析器，无外部依赖
```

### 核心解析器 (`lib/markdown-parser.ts`)

这是项目最关键的文件。它是一个**自研的轻量级 Markdown → HTML 转换器**（不依赖 marked/remark 等库），所有样式**全部内联**，以确保粘贴进微信编辑器后样式不丢失。

解析顺序（顺序非常重要，不可随意调整）：
1. 提取代码块为占位符（防止内部 `#` 被误解析为标题）
2. 行内代码
3. 水平线
4. 引用块
5. 标题（H6 → H1，从长到短匹配）
6. 粗体 / 斜体 / 粗斜体
7. 删除线
8. 图片
9. 链接
10. 无序列表
11. 有序列表
12. 表格
13. 段落包裹
14. 还原代码块占位符

**微信兼容性关键约束**（修改解析器时必须遵守）：
- 使用 `<section>` 代替 `<div>` 来承载背景色，因为微信编辑器会剥除 `<div>` 的 `background`
- 使用 `float` 布局代替 `display:flex`，因为微信会剥除 flex 布局
- 不能依赖外部 CSS 类，所有样式必须 inline

### 设计 Token (`app/globals.css`)

品牌色为橙色系（`--brand: #E85D04`），通过 CSS 自定义变量控制工具区域的视觉风格：

| 变量 | 用途 |
|------|------|
| `--tool-editor-bg` | 左侧编辑区背景 |
| `--tool-preview-bg` | 右侧预览区背景 |
| `--tool-header-bg` | 顶部导航栏背景 |
| `--brand` | 主题橙色 `#E85D04` |
| `--brand-light` | 橙色浅底 `#FFF1E9` |

## 关键约定

- `@/*` 路径别名指向项目根目录
- 所有组件文件均为 `"use client"`（纯客户端渲染）
- 项目无测试文件、无 API 路由、无数据库
- shadcn/ui 组件直接放在 `components/ui/`，不要修改这些文件，通过覆盖 CSS 变量来定制样式
