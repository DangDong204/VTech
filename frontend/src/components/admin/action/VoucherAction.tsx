import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { VoucherResponse } from '@/services/voucher/voucher.type'
import { EditVoucherDialog } from '@/components/admin/data/manage-voucher/update/EditVoucherDialog'
import { DeleteVoucherDialog } from '@/components/admin/data/manage-voucher/delete/DeleteVoucherDialog'
import { ViewVoucherDialog } from '@/components/admin/data/manage-voucher/read/ViewVoucherDialog'

interface VoucherActionsCellProps {
  voucher: VoucherResponse
}

export function VoucherActionsCell({ voucher }: VoucherActionsCellProps) {
  const [openView, setOpenView] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-yellow-100 hover:text-orange-700 dark:hover:bg-yellow-100/20'
          onClick={() => setOpenEdit(true)}
        >
          <Edit className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 '
          onClick={() => setOpenView(true)}
        >
          <Eye className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
          onClick={() => setOpenDelete(true)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      <ViewVoucherDialog open={openView} onOpenChange={setOpenView} voucher={voucher} />
      <EditVoucherDialog open={openEdit} onOpenChange={setOpenEdit} voucher={voucher} />
      <DeleteVoucherDialog open={openDelete} onOpenChange={setOpenDelete} voucher={voucher} />
    </>
  )
}
