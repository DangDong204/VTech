import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import CharacterCount from '@tiptap/extension-character-count'
import { EditorToolbar } from './EditorToolbar'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { uploadArticleImageApi } from '@/services/article/article.api'
import { toast } from 'sonner'

interface ArticleEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
  error?: boolean
}

export function ArticleEditor({
  value,
  onChange,
  placeholder = 'Bắt đầu viết nội dung bài viết...',
  className,
  error
}: ArticleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: 'rounded-md bg-muted p-4 font-mono text-sm' } }
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-md mx-auto my-4' },
        allowBase64: false // Luôn dùng URL từ S3, không dùng base64
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline underline-offset-2 cursor-pointer' }
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:h-0 before:pointer-events-none'
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      CharacterCount
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.isEmpty ? '' : editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[320px] p-4 leading-relaxed'
      }
    }
  })

  // Đồng bộ giá trị khi edit bài viết
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  // Upload ảnh file → S3 → lấy URL → chèn vào editor
  const handleImageUpload = async (file: File) => {
    const toastId = toast.loading('Đang tải ảnh lên...')
    try {
      const url = await uploadArticleImageApi(file)
      editor?.chain().focus().setImage({ src: url }).run()
      toast.success('Tải ảnh thành công', { id: toastId })
    } catch {
      toast.error('Tải ảnh thất bại, vui lòng thử lại', { id: toastId })
    }
  }

  const characterCount = editor?.storage.characterCount.characters() ?? 0
  const wordCount = editor?.storage.characterCount.words() ?? 0

  return (
    <div className={cn('flex flex-col', className)}>
      <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />

      <div
        className={cn(
          'rounded-b-md border bg-background transition-colors',
          error && 'border-destructive',
          'focus-within:ring-1 focus-within:ring-ring'
        )}
      >
        <EditorContent editor={editor} />
      </div>

      <div className='mt-1 flex items-center justify-end gap-3 text-xs text-muted-foreground'>
        <span>{wordCount} từ</span>
        <span>{characterCount} ký tự</span>
      </div>

      <style>{`
        .ProseMirror { outline: none; }
        .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; margin: 0.875rem 0 0.5rem; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .ProseMirror p { margin: 0.5rem 0; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror blockquote {
          border-left: 3px solid hsl(var(--border));
          padding-left: 1rem; margin: 0.75rem 0;
          color: hsl(var(--muted-foreground)); font-style: italic;
        }
        .ProseMirror pre {
          background: hsl(var(--muted)); border-radius: 0.375rem;
          padding: 0.75rem 1rem; font-family: var(--font-mono, monospace);
          font-size: 0.875rem; overflow-x: auto; margin: 0.75rem 0;
        }
        .ProseMirror code {
          background: hsl(var(--muted)); border-radius: 0.25rem;
          padding: 0.125rem 0.375rem; font-family: var(--font-mono, monospace); font-size: 0.875em;
        }
        .ProseMirror pre code { background: none; padding: 0; }
        .ProseMirror hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 1.5rem 0; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.375rem; margin: 1rem auto; display: block; }
        .ProseMirror a { color: hsl(var(--primary)); text-decoration: underline; }
      `}</style>
    </div>
  )
}
