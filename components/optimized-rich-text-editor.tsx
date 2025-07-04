"use client"

import type React from "react"
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
} from "lucide-react"
import { memo, useCallback, useMemo } from "react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  readOnly?: boolean
}

// Memoized toolbar button for better performance
const ToolbarButton = memo(
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
      disabled={disabled}
      className={`h-9 w-9 p-0 rounded-lg transition-colors duration-150 ${
        isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100"
      }`}
      title={tooltip}
    >
      {children}
    </Button>
  ),
)

ToolbarButton.displayName = "ToolbarButton"

export const RichTextEditor = memo(({ content, onChange, readOnly = false }: RichTextEditorProps) => {
  // Optimized onChange handler
  const handleUpdate = useCallback(
    ({ editor }: any) => {
      if (!readOnly) {
        // Use requestAnimationFrame to defer the update and improve performance
        requestAnimationFrame(() => {
          onChange(editor.getHTML())
        })
      }
    },
    [onChange, readOnly],
  )

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          // Disable history extension to improve performance
          history: {
            depth: 50, // Reduce history depth
          },
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
      ],
      content,
      editable: !readOnly,
      onUpdate: handleUpdate,
      editorProps: {
        attributes: {
          class: "prose prose-lg max-w-none focus:outline-none min-h-[600px] px-6 py-6",
          spellcheck: "false", // Disable spellcheck for better performance
        },
      },
      // Optimize editor creation
      immediatelyRender: false,
    },
    [readOnly],
  )

  // Memoize toolbar actions for better performance
  const toolbarActions = useMemo(() => {
    if (!editor) return {}

    return {
      undo: () => editor.chain().focus().undo().run(),
      redo: () => editor.chain().focus().redo().run(),
      toggleBold: () => editor.chain().focus().toggleBold().run(),
      toggleItalic: () => editor.chain().focus().toggleItalic().run(),
      toggleUnderline: () => editor.chain().focus().toggleUnderline().run(),
      toggleH1: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      toggleH2: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      toggleH3: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      toggleBulletList: () => editor.chain().focus().toggleBulletList().run(),
      toggleOrderedList: () => editor.chain().focus().toggleOrderedList().run(),
      setAlignLeft: () => editor.chain().focus().setTextAlign("left").run(),
      setAlignCenter: () => editor.chain().focus().setTextAlign("center").run(),
      setAlignRight: () => editor.chain().focus().setTextAlign("right").run(),
      toggleBlockquote: () => editor.chain().focus().toggleBlockquote().run(),
    }
  }, [editor])

  if (!editor) {
    return (
      <div className="border-0 rounded-2xl overflow-hidden bg-white shadow-lg">
        <div className="p-8 text-center text-gray-500">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="border-0 rounded-2xl overflow-hidden bg-white shadow-lg">
      {/* Simplified Toolbar */}
      <div className="border-b border-gray-100 p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Type className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Format</h3>
              <p className="text-xs text-gray-500">Style your text</p>
            </div>
          </div>
          {readOnly && (
            <Badge variant="secondary" className="flex items-center space-x-1 text-xs">
              <Lock className="h-3 w-3" />
              <span>View Only</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-1 flex-wrap gap-1 bg-white rounded-xl p-2 border border-gray-100">
          {/* History */}
          <ToolbarButton onClick={toolbarActions.undo} disabled={!editor.can().undo()} tooltip="Undo">
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toolbarActions.redo} disabled={!editor.can().redo()} tooltip="Redo">
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <ToolbarButton
            onClick={toolbarActions.toggleH1}
            isActive={editor.isActive("heading", { level: 1 })}
            tooltip="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={toolbarActions.toggleH2}
            isActive={editor.isActive("heading", { level: 2 })}
            tooltip="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={toolbarActions.toggleH3}
            isActive={editor.isActive("heading", { level: 3 })}
            tooltip="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Formatting */}
          <ToolbarButton onClick={toolbarActions.toggleBold} isActive={editor.isActive("bold")} tooltip="Bold">
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={toolbarActions.toggleItalic} isActive={editor.isActive("italic")} tooltip="Italic">
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={toolbarActions.toggleUnderline}
            isActive={editor.isActive("underline")}
            tooltip="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={toolbarActions.toggleBulletList}
            isActive={editor.isActive("bulletList")}
            tooltip="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={toolbarActions.toggleOrderedList}
            isActive={editor.isActive("orderedList")}
            tooltip="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment */}
          <ToolbarButton
            onClick={toolbarActions.setAlignLeft}
            isActive={editor.isActive({ textAlign: "left" })}
            tooltip="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={toolbarActions.setAlignCenter}
            isActive={editor.isActive({ textAlign: "center" })}
            tooltip="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={toolbarActions.setAlignRight}
            isActive={editor.isActive({ textAlign: "right" })}
            tooltip="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Quote */}
          <ToolbarButton
            onClick={toolbarActions.toggleBlockquote}
            isActive={editor.isActive("blockquote")}
            tooltip="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Optimized Editor Content */}
      <div className="relative bg-white min-h-[600px]">
        <EditorContent editor={editor} />
        {readOnly && (
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-white/90 text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Read Only
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
})

RichTextEditor.displayName = "RichTextEditor"
