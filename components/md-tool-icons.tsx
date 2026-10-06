"use client"

import type { ReactNode } from "react"
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Table,
  Terminal,
} from "lucide-react"

/** 工具 id → 图标，工具栏 / 右键菜单共用 */
export const MD_TOOL_ICONS: Record<string, ReactNode> = {
  h1: <Heading1 size={14} />,
  h2: <Heading2 size={14} />,
  h3: <Heading3 size={14} />,
  bold: <Bold size={14} />,
  italic: <Italic size={14} />,
  strike: <Strikethrough size={14} />,
  code: <Terminal size={14} />,
  quote: <Quote size={14} />,
  ul: <List size={14} />,
  ol: <ListOrdered size={14} />,
  hr: <Minus size={14} />,
  link: <Link2 size={14} />,
  image: <ImageIcon size={14} />,
  fence: <Code2 size={14} />,
  table: <Table size={14} />,
}
