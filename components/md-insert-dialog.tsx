"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CODE_LANG_OPTIONS,
  buildCodeBlockMd,
  buildImageMd,
  buildLinkMd,
  buildTableMd,
  type InsertDialogKind,
} from "@/lib/md-edit"

const TITLES: Record<InsertDialogKind, { title: string; desc: string }> = {
  link: { title: "插入链接", desc: "填写显示文字和网址，确认后写入编辑区" },
  image: { title: "插入图片", desc: "填写图片说明和图片地址" },
  code: { title: "插入代码块", desc: "选择语言并粘贴代码" },
  table: { title: "插入表格", desc: "填写表头（逗号分隔）和行数" },
}

export function MdInsertDialog({
  kind,
  open,
  selectedText,
  onOpenChange,
  onInsert,
}: {
  kind: InsertDialogKind | null
  open: boolean
  selectedText: string
  onOpenChange: (open: boolean) => void
  onInsert: (snippet: string) => void
}) {
  const [linkText, setLinkText] = useState("")
  const [linkUrl, setLinkUrl] = useState("https://")
  const [imageAlt, setImageAlt] = useState("图片描述")
  const [imageUrl, setImageUrl] = useState("https://")
  const [codeLang, setCodeLang] = useState("javascript")
  const [codeBody, setCodeBody] = useState("")
  const [tableHeaders, setTableHeaders] = useState("列1, 列2, 列3")
  const [tableRows, setTableRows] = useState("2")

  const guardRef = useRef(false)

  useEffect(() => {
    if (!open) return
    guardRef.current = true
    const timer = window.setTimeout(() => {
      guardRef.current = false
    }, 280)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open || !kind) return
    if (kind === "link") {
      setLinkText(selectedText || "链接文字")
      setLinkUrl("https://")
    } else if (kind === "image") {
      setImageAlt(selectedText || "图片描述")
      setImageUrl("https://")
    } else if (kind === "code") {
      setCodeLang("javascript")
      setCodeBody(selectedText || "")
    } else if (kind === "table") {
      setTableHeaders("列1, 列2, 列3")
      setTableRows("2")
    }
  }, [open, kind, selectedText])

  const meta = kind ? TITLES[kind] : TITLES.link

  const submit = () => {
    if (!kind) return
    let snippet = ""
    if (kind === "link") snippet = buildLinkMd(linkText, linkUrl)
    if (kind === "image") snippet = buildImageMd(imageAlt, imageUrl)
    if (kind === "code") snippet = buildCodeBlockMd(codeLang, codeBody)
    if (kind === "table") {
      const rows = Number.parseInt(tableRows, 10)
      snippet = buildTableMd(tableHeaders, Number.isFinite(rows) ? rows : 2)
    }
    onInsert(snippet)
    onOpenChange(false)
  }

  return (
    <Dialog open={open && !!kind} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (guardRef.current) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          if (guardRef.current) e.preventDefault()
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>{meta.desc}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          {kind === "link" && (
            <>
              <Field label="显示文字">
                <Input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="链接文字"
                  autoFocus
                />
              </Field>
              <Field label="链接地址">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://"
                />
              </Field>
            </>
          )}

          {kind === "image" && (
            <>
              <Field label="图片说明">
                <Input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="图片描述"
                  autoFocus
                />
              </Field>
              <Field label="图片地址">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://"
                />
              </Field>
            </>
          )}

          {kind === "code" && (
            <>
              <Field label="语言">
                <select
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value)}
                  className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  {CODE_LANG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="代码内容">
                <Textarea
                  value={codeBody}
                  onChange={(e) => setCodeBody(e.target.value)}
                  placeholder="在此粘贴或输入代码…"
                  className="min-h-32 font-mono text-sm"
                  autoFocus
                />
              </Field>
            </>
          )}

          {kind === "table" && (
            <>
              <Field label="表头（用逗号分隔）">
                <Input
                  value={tableHeaders}
                  onChange={(e) => setTableHeaders(e.target.value)}
                  placeholder="列1, 列2, 列3"
                  autoFocus
                />
              </Field>
              <Field label="数据行数">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(e.target.value)}
                />
              </Field>
            </>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-md px-4 text-sm font-medium"
            style={{
              color: "var(--tool-label-text)",
              border: "1px solid var(--tool-divider)",
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-9 rounded-md px-4 text-sm font-semibold text-white"
            style={{ background: "var(--brand)" }}
          >
            插入到编辑区
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs" style={{ color: "var(--tool-label-text)" }}>
        {label}
      </Label>
      {children}
    </div>
  )
}
