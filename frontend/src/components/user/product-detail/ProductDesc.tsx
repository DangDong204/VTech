import { useState } from 'react'
import { BookOpen, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductDescriptionProps {
  content: string
}

export function ProductDescription({ content }: ProductDescriptionProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  if (!content) return <p className='text-muted-foreground text-sm'>Đang cập nhật thông tin...</p>

  return (
    <>
      {/* --- Khối Preview (Giới hạn chiều cao) --- */}
      <div className='relative'>
        <div
          className='text-slate-700 leading-relaxed whitespace-pre-line text-sm overflow-hidden'
          style={{ maxHeight: '280px' }} // Giới hạn chiều cao hiển thị ban đầu
        >
          {content}
        </div>

        {/* Lớp phủ gradient làm mờ chữ ở đáy */}
        <div className='absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none' />
      </div>

      {/* Nút Xem thêm */}
      <div className='mt-2 flex justify-center relative z-10'>
        <button
          onClick={() => setSheetOpen(true)}
          className='flex items-center justify-center gap-1.5 py-2 px-8 rounded-lg border border-blue-600 text-blue-600 font-medium text-sm hover:bg-blue-50 transition-colors shadow-sm'
        >
          Xem thêm điểm nổi bật
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>

      {/* --- Cửa sổ Sheet bên TRÁI --- */}
      <>
        {/* Backdrop (Lớp nền đen mờ) */}
        <div
          className={cn(
            'fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 backdrop-blur-sm',
            sheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => setSheetOpen(false)}
        />

        {/* Bảng nội dung (Trượt từ trái sang) */}
        <div
          className={cn(
            'fixed top-0 left-0 h-full w-full sm:w-[600px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300',
            sheetOpen ? 'translate-x-0' : '-translate-x-full' // Đổi thành -translate-x-full để trượt từ trái
          )}
        >
          {/* Header cố định */}
          <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-red-500 shrink-0'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5 text-white' />
              <div>
                <h3 className='text-base font-bold text-white leading-tight'>Mô tả sản phẩm</h3>
              </div>
            </div>
            <button
              onClick={() => setSheetOpen(false)}
              className='rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          {/* Nội dung đầy đủ có thanh cuộn */}
          <div className='flex-1 overflow-y-auto px-6 py-6 custom-scrollbar'>
            <div className='text-slate-800 leading-relaxed whitespace-pre-line text-base'>
              {content}
            </div>

            {/* Nút đóng ở cuối bài viết */}
            <div className='mt-8 pt-4 border-t border-border flex justify-center'>
              <button
                onClick={() => setSheetOpen(false)}
                className='py-2 px-8 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors'
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      </>
    </>
  )
}
