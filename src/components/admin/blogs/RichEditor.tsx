'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabaseClient'


interface RichEditorProps {
  content: string
  onChange: (content: string) => void
}

export function RichEditor({ content, onChange }: RichEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const { toast } = useToast()

  // Convert HTML to JSON for TipTap
  const getInitialContent = useCallback(() => {
    if (content && content.trim() !== '') {
      return content
    }
    return '<p></p>'
  }, [content])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: getInitialContent(),
    onUpdate: ({ editor }) => {
      // Convert to HTML and pass to parent
      const html = editor.getHTML()
      onChange(html)
    },
  })

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const initialContent = getInitialContent()
      editor.commands.setContent(initialContent)
    }
  }, [editor, content, getInitialContent])

  const handleImageUpload = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      console.log('RichEditor: Uploading image:', { filePath, fileType: file.type, fileSize: file.size })

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('RichEditor: Supabase storage error:', uploadError)
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      console.log('RichEditor: Image uploaded successfully:', publicUrl)

      editor?.chain().focus().setImage({ src: publicUrl }).run()

      toast({
        title: 'Success',
        description: 'Image uploaded and inserted successfully',
      })
    } catch (error) {
      console.error('RichEditor: Error uploading image:', error)
      
      let errorMessage = 'Failed to upload image'
      if (error instanceof Error) {
        if (error.message.includes('policy')) {
          errorMessage = 'Storage permissions not configured. Please set up storage policies.'
        } else if (error.message.includes('bucket')) {
          errorMessage = 'Storage bucket not accessible. Please check bucket configuration.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-muted' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setIsLinkModalOpen(true)}
          className={editor.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) {
                await handleImageUpload(file)
              }
            }
            input.click()
          }}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">Add Link</h3>
            <Input
              type="url"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsLinkModalOpen(false)
                  setLinkUrl('')
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (linkUrl) {
                    editor.chain().focus().setLink({ href: linkUrl }).run()
                    setIsLinkModalOpen(false)
                    setLinkUrl('')
                  }
                }}
              >
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-md p-4 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
} 