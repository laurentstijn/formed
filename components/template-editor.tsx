"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  Minus,
  Plus,
  Palette,
  Undo,
  Redo,
  Trash2,
  Send,
  Eye,
  GripVertical,
  Type,
  Table,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Block {
  id: string
  type: "text" | "image" | "divider" | "table" | "variable"
  content: string
  styles: {
    fontSize?: number
    fontWeight?: string
    fontStyle?: string
    textDecoration?: string
    textAlign?: string
    color?: string
    headerBgColor?: string
    borderColor?: string
    rowBgColor?: string
  }
  tableStyles?: {
    headerBg: string
    borderColor: string
    rowBg: string
    textAlign: "left" | "center" | "right"
  }
}

interface TemplateEditorProps {
  value: string
  onChange: (value: string) => void
  title: string
  variables?: string[]
  templateType?: "order_email" | "shipping_email" | "admin_email" | "invoice_header" | "invoice_footer"
  subject?: string
  onSubjectChange?: (subject: string) => void
}

export function TemplateEditor({
  value,
  onChange,
  title,
  variables = [],
  templateType,
  subject = "",
  onSubjectChange,
}: TemplateEditorProps) {
  const parseHtmlToBlocks = (html: string): Block[] => {
    if (!html || html === "<p><br></p>") {
      return [
        {
          id: Date.now().toString(),
          type: "text",
          content: "",
          styles: { fontSize: 16, textAlign: "left", color: "#000000" },
        },
      ]
    }

    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    const blocks: Block[] = []
    let blockId = Date.now()

    Array.from(tempDiv.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const tagName = element.tagName.toLowerCase()

        if (tagName === "img") {
          blocks.push({
            id: (blockId++).toString(),
            type: "image",
            content: element.getAttribute("src") || "",
            styles: {},
          })
        } else if (tagName === "hr") {
          blocks.push({
            id: (blockId++).toString(),
            type: "divider",
            content: "",
            styles: {},
          })
        } else if (tagName === "table") {
          blocks.push({
            id: (blockId++).toString(),
            type: "table",
            content: element.outerHTML,
            styles: {
              headerBgColor: element.style.backgroundColor || "#f3f4f6",
              borderColor: element.style.border || "#e5e7eb",
              rowBgColor: element.style.backgroundColor || "white",
              textAlign: element.style.textAlign || "left",
            },
            tableStyles: {
              headerBg: element.style.backgroundColor || "#6b7280",
              borderColor: element.style.border || "#d1d5db",
              rowBg: element.style.backgroundColor || "#f9fafb",
              textAlign: element.style.textAlign || "left",
            },
          })
        } else {
          blocks.push({
            id: (blockId++).toString(),
            type: "text",
            content: element.innerHTML || element.textContent || "",
            styles: {
              fontSize: 16,
              textAlign: "left",
              color: "#000000",
            },
          })
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        blocks.push({
          id: (blockId++).toString(),
          type: "text",
          content: node.textContent,
          styles: {
            fontSize: 16,
            textAlign: "left",
            color: "#000000",
          },
        })
      }
    })

    return blocks.length > 0
      ? blocks
      : [
          {
            id: Date.now().toString(),
            type: "text",
            content: "",
            styles: { fontSize: 16, textAlign: "left", color: "#000000" },
          },
        ]
  }

  const [blocks, setBlocks] = useState<Block[]>(parseHtmlToBlocks(value))
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [history, setHistory] = useState<Block[][]>([blocks])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [testEmail, setTestEmail] = useState("")
  const [sendingTest, setSendingTest] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tableStyles, setTableStyles] = useState<{
    headerBg: string
    borderColor: string
    rowBg: string
    textAlign: "left" | "center" | "right"
  }>({
    headerBg: "#f3f4f6",
    borderColor: "#e5e7eb",
    rowBg: "#ffffff",
    textAlign: "left",
  })

  const blocksToHtml = (blocksList: Block[]): string => {
    return blocksList
      .map((block) => {
        const styleStr = Object.entries(block.styles)
          .map(([key, val]) => {
            const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase()
            return `${cssKey}: ${val}${typeof val === "number" ? "px" : ""}`
          })
          .join("; ")

        switch (block.type) {
          case "text":
            return `<p style="${styleStr}">${block.content || "<br>"}</p>`
          case "image":
            return `<img src="${block.content}" alt="Template image" style="max-width: 400px; height: auto; margin: 10px 0;" />`
          case "divider":
            return '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 20px 0;" />'
          case "table":
            const tableStyles = block.tableStyles || {
              headerBg: "#6b7280",
              borderColor: "#d1d5db",
              rowBg: "#f9fafb",
              textAlign: "left",
            }
            return `
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background-color: ${tableStyles.headerBg}; color: white;">
                    <th style="padding: 12px; border: 1px solid ${tableStyles.borderColor}; text-align: ${tableStyles.textAlign};">Product</th>
                    <th style="padding: 12px; border: 1px solid ${tableStyles.borderColor}; text-align: ${tableStyles.textAlign};">Aantal</th>
                    <th style="padding: 12px; border: 1px solid ${tableStyles.borderColor}; text-align: ${tableStyles.textAlign};">Prijs</th>
                  </tr>
                </thead>
                <tbody>
                  {{products}}
                </tbody>
                <tfoot>
                  <tr style="background-color: ${tableStyles.headerBg}; color: white; font-weight: bold;">
                    <td colspan="2" style="padding: 12px; border: 1px solid ${tableStyles.borderColor}; text-align: ${tableStyles.textAlign};">Totaal (incl. BTW)</td>
                    <td style="padding: 12px; border: 1px solid ${tableStyles.borderColor}; text-align: ${tableStyles.textAlign};">{{total}}</td>
                  </tr>
                </tfoot>
              </table>
            `
          case "variable":
            return `<span style="${styleStr}">{{${block.content}}}</span>`
          default:
            return ""
        }
      })
      .join("")
  }

  const updateBlocks = (newBlocks: Block[]) => {
    setBlocks(newBlocks)
    const html = blocksToHtml(newBlocks)
    onChange(html)

    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newBlocks)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  const handleDragStart = (blockId: string) => {
    setDraggedBlockId(blockId)
  }

  const handleDragOver = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault()
    if (!draggedBlockId || draggedBlockId === targetBlockId) return

    const draggedIndex = blocks.findIndex((b) => b.id === draggedBlockId)
    const targetIndex = blocks.findIndex((b) => b.id === targetBlockId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newBlocks = [...blocks]
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1)
    newBlocks.splice(targetIndex, 0, draggedBlock)

    setBlocks(newBlocks)
  }

  const handleDragEnd = () => {
    if (draggedBlockId) {
      updateBlocks(blocks)
    }
    setDraggedBlockId(null)
  }

  const addBlock = (type: Block["type"], content = "") => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content,
      styles: type === "text" ? { fontSize: 16, textAlign: "left", color: "#000000" } : {},
    }
    updateBlocks([...blocks, newBlock])
    setSelectedBlockId(newBlock.id)
  }

  const updateBlockContent = (blockId: string, content: string) => {
    const newBlocks = blocks.map((block) => (block.id === blockId ? { ...block, content } : block))
    setBlocks(newBlocks)
  }

  const updateBlockStyle = (blockId: string, styleKey: keyof Block["styles"], value: any) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, styles: { ...block.styles, [styleKey]: value } } : block,
    )
    updateBlocks(newBlocks)
  }

  const deleteBlock = (blockId: string) => {
    if (blocks.length === 1) {
      toast({
        title: "Kan niet verwijderen",
        description: "Je moet minimaal één blok hebben",
        variant: "destructive",
      })
      return
    }
    const newBlocks = blocks.filter((b) => b.id !== blockId)
    updateBlocks(newBlocks)
    setSelectedBlockId(null)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const newBlocks = history[newIndex]
      setHistoryIndex(newIndex)
      setBlocks(newBlocks)
      onChange(blocksToHtml(newBlocks))
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const newBlocks = history[newIndex]
      setHistoryIndex(newIndex)
      setBlocks(newBlocks)
      onChange(blocksToHtml(newBlocks))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()

      addBlock("image", url)

      toast({
        title: "Afbeelding toegevoegd",
        description: "Je afbeelding is succesvol geüpload",
      })
    } catch (error) {
      toast({
        title: "Upload mislukt",
        description: "Er ging iets mis bij het uploaden van de afbeelding",
        variant: "destructive",
      })
    }
  }

  const insertOrderTable = () => {
    const table: Block = {
      id: Date.now().toString(),
      type: "table",
      content: "",
      styles: {
        headerBgColor: tableStyles.headerBg,
        borderColor: tableStyles.borderColor,
        rowBgColor: tableStyles.rowBg,
        textAlign: tableStyles.textAlign,
      },
      tableStyles: {
        headerBg: tableStyles.headerBg,
        borderColor: tableStyles.borderColor,
        rowBg: tableStyles.rowBg,
        textAlign: tableStyles.textAlign,
      },
    }
    updateBlocks([...blocks, table])
    setSelectedBlockId(table.id)
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email vereist",
        description: "Voer een email adres in om een test te verzenden",
        variant: "destructive",
      })
      return
    }

    setSendingTest(true)
    try {
      const htmlContent = blocksToHtml(blocks)
      console.log("[v0] Generated HTML for test email:", htmlContent)
      console.log("[v0] Template type:", templateType)
      console.log("[v0] Subject:", subject)
      console.log("[v0] Recipient:", testEmail)

      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType,
          template: htmlContent,
          recipientEmail: testEmail,
          subject,
        }),
      })

      console.log("[v0] Test email response status:", response.status)
      const responseData = await response.json()
      console.log("[v0] Test email response data:", responseData)

      if (!response.ok) throw new Error("Failed to send test email")

      toast({
        title: "Test email verzonden",
        description: `Een test email is verzonden naar ${testEmail}`,
      })
      setTestEmail("")
    } catch (error) {
      console.error("[v0] Error sending test email:", error)
      toast({
        title: "Verzenden mislukt",
        description: "Er ging iets mis bij het verzenden van de test email",
        variant: "destructive",
      })
    } finally {
      setSendingTest(false)
    }
  }

  const isEmailTemplate = templateType?.includes("email")
  const isInvoiceTemplate = templateType?.includes("invoice")

  const updateTableStyles = (blockId: string, styles: typeof tableStyles) => {
    const newTable: Block = {
      id: blockId,
      type: "table",
      content: "",
      styles: {
        headerBgColor: styles.headerBg,
        borderColor: styles.borderColor,
        rowBgColor: styles.rowBg,
        textAlign: styles.textAlign,
      },
      tableStyles: styles,
    }
    updateBlock(blockId, newTable)
  }

  const updateBlock = (blockId: string, newBlock: Block) => {
    const newBlocks = blocks.map((block) => (block.id === blockId ? newBlock : block))
    updateBlocks(newBlocks)
  }

  const renderBlock = (block: Block) => {
    const isSelected = selectedBlockId === block.id

    return (
      <div
        key={block.id}
        draggable
        onDragStart={() => handleDragStart(block.id)}
        onDragOver={(e) => handleDragOver(e, block.id)}
        onDragEnd={handleDragEnd}
        onClick={() => setSelectedBlockId(block.id)}
        className={`group relative border-2 ${
          isSelected ? "border-blue-500" : "border-transparent"
        } rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors`}
      >
        {/* Drag handle */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
        </div>

        {/* Delete button */}
        {isSelected && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute right-2 top-2"
            onClick={(e) => {
              e.stopPropagation()
              deleteBlock(block.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {block.type === "text" && (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateBlockContent(block.id, e.currentTarget.innerHTML)}
            style={{
              fontSize: `${block.styles.fontSize || 16}px`,
              fontWeight: block.styles.fontWeight || "normal",
              fontStyle: block.styles.fontStyle || "normal",
              textDecoration: block.styles.textDecoration || "none",
              textAlign: (block.styles.textAlign as any) || "left",
              color: block.styles.color || "#000000",
              outline: "none",
              minHeight: "24px",
            }}
            dangerouslySetInnerHTML={{ __html: block.content || "<br>" }}
          />
        )}

        {block.type === "image" && (
          <div className="flex justify-center">
            <img
              src={block.content || "/placeholder.svg"}
              alt="Template image"
              className="max-w-full h-auto rounded-lg"
              style={{ maxWidth: "400px" }}
            />
          </div>
        )}

        {block.type === "divider" && <hr className="border-none border-t-2 border-gray-300 my-4" />}

        {block.type === "table" && (
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse"
              style={{
                borderColor: block.styles.borderColor || "#e5e7eb",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: block.styles.headerBgColor || "#f3f4f6",
                  }}
                >
                  <th
                    className="border px-4 py-2 font-semibold"
                    style={{
                      borderColor: block.styles.borderColor || "#e5e7eb",
                      textAlign: block.styles.textAlign || "left",
                    }}
                  >
                    Product
                  </th>
                  <th
                    className="border px-4 py-2 font-semibold"
                    style={{
                      borderColor: block.styles.borderColor || "#e5e7eb",
                      textAlign: block.styles.textAlign || "left",
                    }}
                  >
                    Aantal
                  </th>
                  <th
                    className="border px-4 py-2 font-semibold"
                    style={{
                      borderColor: block.styles.borderColor || "#e5e7eb",
                      textAlign: block.styles.textAlign || "left",
                    }}
                  >
                    Prijs
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    backgroundColor: block.styles.rowBgColor || "white",
                  }}
                >
                  <td
                    className="border px-4 py-2"
                    style={{
                      borderColor: block.styles.borderColor || "#e5e7eb",
                      textAlign: block.styles.textAlign || "left",
                    }}
                  >
                    {"{{products}}"}
                  </td>
                  <td
                    className="border px-4 py-2"
                    style={{
                      borderColor: block.styles.borderColor || "#e5e7eb",
                      textAlign: "center",
                    }}
                  >
                    -
                  </td>
                  <td
                    className="border px-4 py-2"
                    style={{
                      borderColor: block.styles.borderColor || "#e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    -
                  </td>
                </tr>
                <tr
                  style={{
                    backgroundColor: block.styles.headerBgColor || "#f3f4f6",
                  }}
                >
                  <td
                    className="border px-4 py-2 font-semibold"
                    style={{
                      borderColor: block.styles.borderColor || "#e5e7eb",
                      textAlign: block.styles.textAlign || "left",
                    }}
                  >
                    Totaal (incl. BTW)
                  </td>
                  <td
                    className="border px-4 py-2"
                    style={{
                      borderColor: block.styles.borderColor || "#e5e7eb",
                    }}
                  ></td>
                  <td
                    className="border px-4 py-2 font-bold text-lg"
                    style={{
                      borderColor: block.styles.borderColor || "#e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    {"{{total}}"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Table styling controls when selected */}
            {isSelected && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <h4 className="font-semibold text-sm">Tabel opmaak</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Header achtergrond</Label>
                    <Input
                      type="color"
                      value={block.tableStyles?.headerBg || "#6b7280"}
                      onChange={(e) => updateTableStyles(block.id, { ...block.tableStyles, headerBg: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Lijn kleur</Label>
                    <Input
                      type="color"
                      value={block.tableStyles?.borderColor || "#d1d5db"}
                      onChange={(e) =>
                        updateTableStyles(block.id, { ...block.tableStyles, borderColor: e.target.value })
                      }
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Rij achtergrond</Label>
                    <Input
                      type="color"
                      value={block.tableStyles?.rowBg || "#f9fafb"}
                      onChange={(e) => updateTableStyles(block.id, { ...block.tableStyles, rowBg: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tekst uitlijning</Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant={block.tableStyles?.textAlign === "left" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTableStyles(block.id, { ...block.tableStyles, textAlign: "left" })}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={block.tableStyles?.textAlign === "center" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTableStyles(block.id, { ...block.tableStyles, textAlign: "center" })}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={block.tableStyles?.textAlign === "right" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateTableStyles(block.id, { ...block.tableStyles, textAlign: "right" })}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Sleep blokken om ze te verplaatsen. Klik op een blok om het te bewerken of verwijderen.
        </p>
      </div>

      {isEmailTemplate && onSubjectChange && (
        <Card className="p-4">
          <div className="space-y-2">
            <Label htmlFor="email-subject">Email onderwerp</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Onderwerp van de email"
            />
            <p className="text-xs text-muted-foreground">
              {"Je kunt ook variabelen gebruiken in het onderwerp, bijv: Bestelling {{order_number}}"}
            </p>
          </div>
        </Card>
      )}

      {(isEmailTemplate || isInvoiceTemplate) && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-4">
            {isEmailTemplate && (
              <>
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Je email adres voor test"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <Button onClick={sendTestEmail} disabled={sendingTest} variant="secondary">
                  <Send className="h-4 w-4 mr-2" />
                  {sendingTest ? "Verzenden..." : "Test verzenden"}
                </Button>
              </>
            )}
            {isInvoiceTemplate && (
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview factuur
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Factuur preview</DialogTitle>
                    <DialogDescription>Voorbeeld van hoe de factuur eruit ziet met test data</DialogDescription>
                  </DialogHeader>
                  <div className="border rounded-lg p-6 bg-white">
                    <div dangerouslySetInnerHTML={{ __html: blocksToHtml(blocks) }} />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </Card>
      )}

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          {/* Toolbar */}
          <Card className="p-3">
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-1 border-r pr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                  title="Ongedaan maken"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRedo}
                  disabled={historyIndex === history.length - 1}
                  title="Opnieuw"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-1 border-r pr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addBlock("text")}
                  title="Tekst toevoegen"
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  title="Afbeelding toevoegen"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addBlock("divider")}
                  title="Lijn toevoegen"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                {isEmailTemplate && (
                  <Button type="button" variant="ghost" size="sm" onClick={insertOrderTable} title="Tabel toevoegen">
                    <Table className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {selectedBlock?.type === "text" && (
                <>
                  <div className="flex gap-1 border-r pr-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateBlockStyle(
                          selectedBlock.id,
                          "fontWeight",
                          selectedBlock.styles.fontWeight === "bold" ? "normal" : "bold",
                        )
                      }
                      title="Vetgedrukt"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateBlockStyle(
                          selectedBlock.id,
                          "fontStyle",
                          selectedBlock.styles.fontStyle === "italic" ? "normal" : "italic",
                        )
                      }
                      title="Cursief"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateBlockStyle(
                          selectedBlock.id,
                          "textDecoration",
                          selectedBlock.styles.textDecoration === "underline" ? "none" : "underline",
                        )
                      }
                      title="Onderstreept"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-1 border-r pr-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateBlockStyle(selectedBlock.id, "textAlign", "left")}
                      title="Links"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateBlockStyle(selectedBlock.id, "textAlign", "center")}
                      title="Centreren"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateBlockStyle(selectedBlock.id, "textAlign", "right")}
                      title="Rechts"
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-1 border-r pr-2 items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateBlockStyle(
                          selectedBlock.id,
                          "fontSize",
                          Math.max(10, (selectedBlock.styles.fontSize || 16) - 2),
                        )
                      }
                      title="Kleiner"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">{selectedBlock.styles.fontSize || 16}px</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateBlockStyle(
                          selectedBlock.id,
                          "fontSize",
                          Math.min(48, (selectedBlock.styles.fontSize || 16) + 2),
                        )
                      }
                      title="Groter"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Label htmlFor="color-picker" className="cursor-pointer">
                      <Palette className="h-4 w-4" />
                    </Label>
                    <Input
                      id="color-picker"
                      type="color"
                      value={selectedBlock.styles.color || "#000000"}
                      onChange={(e) => updateBlockStyle(selectedBlock.id, "color", e.target.value)}
                      className="w-12 h-8 p-1 cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {variables.length > 0 && (
            <Card className="p-3">
              <Label className="text-sm font-medium mb-2 block">
                Variabelen (klik om in geselecteerd tekst blok te plaatsen)
              </Label>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Button
                    key={variable}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedBlock?.type === "text") {
                        updateBlockContent(selectedBlock.id, `${selectedBlock.content} {{${variable}}}`)
                      } else {
                        addBlock("text", `{{${variable}}}`)
                      }
                    }}
                  >
                    {variable}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Blocks Editor */}
          <Card className="p-4">
            <div className="space-y-2 min-h-[400px]">{blocks.map(renderBlock)}</div>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-6">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: blocksToHtml(blocks) }} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
