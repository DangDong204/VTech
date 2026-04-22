import { ViewReceiptDialog } from '@/components/admin/data/manage-receipt/read/ViewReceiptDialog'
import { Button } from '@/components/ui/button'
import type { ReceiptResponse } from '@/services/receipt/receipt.type'
import { Eye } from 'lucide-react'
import { useState } from 'react'

interface ReceiptActionsCellProps {
  receipt: ReceiptResponse
}

export function ReceiptActionsCell({ receipt }: ReceiptActionsCellProps) {
  const [openView, setOpenView] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='ghost'
          size='default'
          title='Xem chi tiết'
          className='h-8 px-2.5 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20'
          onClick={() => setOpenView(true)}
        >
          <Eye className='h-4 w-4' />
        </Button>
      </div>

      <ViewReceiptDialog open={openView} onOpenChange={setOpenView} receipt={receipt} />
    </>
  )
}
