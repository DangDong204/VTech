import { DeleteVariantDialog } from '@/components/admin/data/manage-variant/delete/DeleteVariantDialog'
import { EditVariantDialog } from '@/components/admin/data/manage-variant/update/EditVariantDialog'
import { Button } from '@/components/ui/button'
import type { ProductVariantResponse } from '@/services/product-variant/variant.type'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function VariantActionsCell({ variant }: { variant: ProductVariantResponse }) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-end gap-2 pr-4'>
        <Button
          variant='ghost'
          className='h-8 px-2.5 text-blue-600'
          onClick={() => setOpenEdit(true)}
        >
          <Edit className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          className='h-8 px-2.5 text-red-600'
          onClick={() => setOpenDelete(true)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {openEdit && (
        <EditVariantDialog open={openEdit} onOpenChange={setOpenEdit} variant={variant} />
      )}
      {openDelete && (
        <DeleteVariantDialog open={openDelete} onOpenChange={setOpenDelete} variant={variant} />
      )}
    </>
  )
}
