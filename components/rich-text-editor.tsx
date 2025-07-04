"use client"

import React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Lock,
  Palette,
  ImageIcon,
  Link,
  Code,
} from "lucide-react"
import { motion } from "framer-motion"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  readOnly?: boolean
}

export function RichTextEditor({ content, onChange, readOnly = false }: RichTextEditorProps) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
      ],
      content,
      editable: !readOnly,
      onUpdate: ({ editor }) => {
        if (!readOnly) {
          // Use requestAnimationFrame to defer the update
          requestAnimationFrame(() => {
            onChange(editor.getHTML())
          })
        }
      },
      editorProps: {
        attributes: {
          class: "prose prose-lg max-w-none focus:outline-none min-h-[700px] px-8 py-8",
        },
        // Add performance optimizations
        handleDOMEvents: {
          keydown: () => {
            // Disable animations during typing
            document.body.classList.add("typing-mode")
            return false
          },
          keyup: () => {
            // Re-enable animations after typing stops
            setTimeout(() => {
              document.body.classList.remove("typing-mode")
            }, 500)
            return false
          },
        },
      },
    },
    [content, readOnly, onChange],
  )

  if (!editor) {
    return null
  }

  const ToolbarButton = React.memo(
    ({
      onClick,
      isActive = false,
      children,
      disabled = false,
      tooltip,
    }: {
      onClick: () => void
      isActive?: boolean
      children: React.ReactNode
      disabled?: boolean
      tooltip?: string
    }) => (
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        onClick={onClick}
        disabled={disabled || readOnly}
        className={`h-10 w-10 p-0 rounded-xl transition-colors duration-150 ${
          isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100"
        }`}
        title={tooltip}
      >
        {children}
      </Button>
    ),
  )

  const ToolbarSection = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center space-x-1 px-2">{children}</div>
  )

  return (
    <div className="border-0 rounded-2xl overflow-hidden bg-white shadow-lg">
      {/* Premium Toolbar */}
      <div className="border-b border-gray-100 p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Type className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Rich Text Editor</h3>
              <p className="text-sm text-gray-500">Format your document with professional tools</p>
            </div>
          </div>
          {readOnly && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Badge
                variant="secondary"
                className="flex items-center space-x-2 bg-orange-100 text-orange-800 border-orange-200 px-3 py-1"
              >
                <Lock className="h-3 w-3" />
                <span className="font-medium">View Only</span>
              </Badge>
            </motion.div>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-100">
          {/* History Section */}
          <ToolbarSection>
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              tooltip="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              tooltip="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarSection>

          <Separator orientation="vertical" className="h-8 bg-gray-200" />

          {/* Headings Section */}
          <ToolbarSection>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive("heading", { level: 1 })}
              tooltip="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
              tooltip="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive("heading", { level: 3 })}
              tooltip="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarSection>

          <Separator orientation="vertical" className="h-8 bg-gray-200" />

          {/* Text Formatting Section */}
          <ToolbarSection>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              tooltip="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              tooltip="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              tooltip="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarSection>

          <Separator orientation="vertical" className="h-8 bg-gray-200" />

          {/* Lists Section */}
          <ToolbarSection>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              tooltip="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              tooltip="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarSection>

          <Separator orientation="vertical" className="h-8 bg-gray-200" />

          {/* Alignment Section */}
          <ToolbarSection>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
              tooltip="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              isActive={editor.isActive({ textAlign: "center" })}
              tooltip="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
              tooltip="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarSection>

          <Separator orientation="vertical" className="h-8 bg-gray-200" />

          {/* Additional Tools */}
          <ToolbarSection>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              tooltip="Quote"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => {}} disabled={readOnly} tooltip="Text Color">
              <Palette className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => {}} disabled={readOnly} tooltip="Insert Image">
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => {}} disabled={readOnly} tooltip="Insert Link">
              <Link className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => {}} disabled={readOnly} tooltip="Code Block">
              <Code className="h-4 w-4" />
            </ToolbarButton>
          </ToolbarSection>
        </div>
      </div>

      {/* Premium Editor Content */}
      <div className="relative bg-white min-h-[700px]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 pointer-events-none" />
        <EditorContent editor={editor} className="relative z-10" />
        {readOnly && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-6 right-6 z-20"
          >
            <Badge
              variant="outline"
              className="bg-white/90 backdrop-blur-sm border-orange-200 text-orange-700 shadow-lg"
            >
              <Lock className="h-3 w-3 mr-2" />
              Read Only Mode
            </Badge>
          </motion.div>
        )}
      </div>
    </div>
  )
}
