import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Link,
  ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  RemoveFormatting
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  tooltip: string
  children: React.ReactNode
}

const ToolbarButton = ({ onClick, isActive, disabled, tooltip, children }: ToolbarButtonProps) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className={cn('h-8 w-8 rounded-md', isActive && 'bg-accent text-accent-foreground')}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side='bottom' className='text-xs'>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

interface EditorToolbarProps {
  editor: Editor | null
  // Callback nhận File → upload S3 → chèn URL vào editor (do ArticleEditor xử lý)
  onImageUpload: (file: File) => Promise<void>
}

export function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Nhập URL liên kết:')
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await onImageUpload(file)
    e.target.value = '' // Reset để có thể chọn lại cùng file
  }

  const addImageByUrl = () => {
    const url = window.prompt('Nhập URL hình ảnh:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className='flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 bg-muted/40 p-1.5'>
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip='Hoàn tác (Ctrl+Z)'
      >
        <Undo className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip='Làm lại (Ctrl+Y)'
      >
        <Redo className='h-3.5 w-3.5' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-0.5 h-6' />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        tooltip='Tiêu đề 1'
      >
        <Heading1 className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        tooltip='Tiêu đề 2'
      >
        <Heading2 className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        tooltip='Tiêu đề 3'
      >
        <Heading3 className='h-3.5 w-3.5' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-0.5 h-6' />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        tooltip='In đậm (Ctrl+B)'
      >
        <Bold className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        tooltip='In nghiêng (Ctrl+I)'
      >
        <Italic className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        tooltip='Gạch chân (Ctrl+U)'
      >
        <Underline className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        tooltip='Gạch ngang'
      >
        <Strikethrough className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        tooltip='Code nội dòng'
      >
        <Code className='h-3.5 w-3.5' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-0.5 h-6' />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        tooltip='Căn trái'
      >
        <AlignLeft className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        tooltip='Căn giữa'
      >
        <AlignCenter className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        tooltip='Căn phải'
      >
        <AlignRight className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        isActive={editor.isActive({ textAlign: 'justify' })}
        tooltip='Căn đều'
      >
        <AlignJustify className='h-3.5 w-3.5' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-0.5 h-6' />

      {/* Lists & blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        tooltip='Danh sách gạch đầu dòng'
      >
        <List className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        tooltip='Danh sách số'
      >
        <ListOrdered className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        tooltip='Trích dẫn'
      >
        <Quote className='h-3.5 w-3.5' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-0.5 h-6' />

      {/* Link & Image */}
      <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} tooltip='Chèn liên kết'>
        <Link className='h-3.5 w-3.5' />
      </ToolbarButton>

      {/* Upload ảnh từ máy → S3 */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 rounded-md'
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className='h-3.5 w-3.5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom' className='text-xs'>
            Chèn ảnh từ máy tính (upload S3)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Chèn ảnh từ URL */}
      <ToolbarButton onClick={addImageByUrl} tooltip='Chèn ảnh từ URL'>
        <span className='text-[10px] font-semibold leading-none'>URL</span>
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-0.5 h-6' />

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip='Đường kẻ ngang'
      >
        <Minus className='h-3.5 w-3.5' />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        tooltip='Xóa định dạng'
      >
        <RemoveFormatting className='h-3.5 w-3.5' />
      </ToolbarButton>
    </div>
  )
}
