import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface ClientPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ClientPagination({ currentPage, totalPages, onPageChange }: ClientPaginationProps) {
  const { t } = useTranslation('common')

  if (totalPages <= 1) return null

  return (
    <div className='flex items-center justify-center space-x-2 mt-8'>
      <Button
        variant='outline'
        size='icon'
        className='hidden sm:flex'
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='icon'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>

      <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
        {t('datatablePagination.page', { current: currentPage, total: totalPages })}
      </div>

      <Button
        variant='outline'
        size='icon'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='icon'
        className='hidden sm:flex'
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight className='h-4 w-4' />
      </Button>
    </div>
  )
}
