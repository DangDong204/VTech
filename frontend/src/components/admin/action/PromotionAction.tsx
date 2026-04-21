import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { EditPromotionDialog } from '@/components/admin/data/manage-promotion/update/EditPromotionDialog'
import { DeletePromotionDialog } from '@/components/admin/data/manage-promotion/delete/DeletePromotionDialog'
import { ViewPromotionDialog } from '@/components/admin/data/manage-promotion/read/ViewPromotionDialog'

interface PromotionActionsCellProps {
  promotion: PromotionResponse
}

export function PromotionActionsCell({ promotion }: PromotionActionsCellProps) {
  const [openView, setOpenView] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='ghost'
          size='default'
          title='Chỉnh sửa'
          className='h-8 px-2.5 hover:bg-yellow-100 hover:text-orange-700 dark:hover:bg-yellow-100/20'
          onClick={() => setOpenEdit(true)}
        >
          <Edit className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='default'
          title='Xem chi tiết'
          className='h-8 px-2.5 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 '
          onClick={() => setOpenView(true)}
        >
          <Eye className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='default'
          title='Xóa'
          className='h-8 px-2.5 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
          onClick={() => setOpenDelete(true)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      <ViewPromotionDialog open={openView} onOpenChange={setOpenView} promotion={promotion} />
      <EditPromotionDialog open={openEdit} onOpenChange={setOpenEdit} promotion={promotion} />
      <DeletePromotionDialog open={openDelete} onOpenChange={setOpenDelete} promotion={promotion} />
    </>
  )
}
