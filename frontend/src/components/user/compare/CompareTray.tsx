import { useCompareStore } from '@/store/compare.store'
import { X, Scale, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface CompareTrayProps {
  isOpen: boolean
  onClose: () => void
}

export function CompareTray({ isOpen, onClose }: CompareTrayProps) {
  const { t } = useTranslation('common')
  const { items, removeItem, clearAll } = useCompareStore()
  const navigate = useNavigate()

  // Nếu không mở hoặc không có sản phẩm nào thì không render
  if (!isOpen || items.length === 0) return null

  return (
    <div className='fixed bottom-24 left-4 sm:left-6 z-50 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 sm:p-5 w-[calc(100vw-2rem)] sm:w-[500px] animate-in slide-in-from-bottom-8 zoom-in-95 duration-300'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4 pb-3 border-b border-slate-100'>
        <div className='font-bold text-slate-800 flex items-center gap-2'>
          <div className='bg-blue-100 p-1.5 rounded-full'>
            <Scale className='w-4 h-4 text-blue-600' />
          </div>
          {t('compare.tray.title', 'So sánh sản phẩm')}{' '}
          <span className='text-red-500'>({items.length}/3)</span>
        </div>
        <button
          onClick={onClose}
          className='text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-1.5 rounded-full transition-colors'
        >
          <X className='w-4 h-4' />
        </button>
      </div>

      {/* Body: Danh sách sản phẩm */}
      <div className='flex items-center gap-3 justify-center mb-5'>
        {items.map((item) => (
          <div
            key={item.slug}
            className='relative w-24 h-24 bg-white border border-slate-200 shadow-sm rounded-xl p-2 flex flex-col items-center justify-center group'
          >
            <button
              onClick={() => removeItem(item.slug)}
              className='absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all z-10'
            >
              <X className='w-3 h-3' />
            </button>
            <img src={item.image} alt={item.name} className='w-full h-full object-contain mb-1' />
          </div>
        ))}
        {/* Ô trống nếu chưa đủ 3 */}
        {Array.from({ length: 3 - items.length }).map((_, i) => (
          <div
            key={i}
            className='w-24 h-24 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center text-slate-300'
          >
            <Scale className='w-6 h-6 opacity-40 mb-1' />
            <span className='text-[10px] font-medium'>{t('compare.tray.addMore', 'Thêm SP')}</span>
          </div>
        ))}
      </div>

      {/* Footer: Nút hành động */}
      <div className='flex items-center gap-3'>
        <Button
          variant='outline'
          onClick={clearAll}
          className='text-slate-500 hover:text-red-600 bg-slate-50 border-slate-200'
        >
          <Trash2 className='w-4 h-4 mr-2' /> {t('compare.tray.clearAll', 'Xóa')}
        </Button>
        <Button
          onClick={() => {
            onClose()
            navigate('/compare')
          }}
          disabled={items.length < 2}
          className='flex-1 bg-red-600 hover:bg-red-700 text-white font-bold'
        >
          {items.length < 2
            ? t('compare.tray.needMore', 'CHỌN THÊM ĐỂ SO SÁNH')
            : t('compare.tray.compareNow', 'SO SÁNH NGAY')}
        </Button>
      </div>
    </div>
  )
}
