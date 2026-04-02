import { DeleteBrandDialog } from '@/components/admin/data/manage-brand/delete/DeleteBrandDialog'
import { EditBrandDialog } from '@/components/admin/data/manage-brand/update/EditBrandDialog'
import { Button } from '@/components/ui/button'
import type { Brand } from '@/pages/admin/manage-brand/columns'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface BrandActionsCellProps {
  brand: Brand
}

export function BrandActionsCell({ brand }: BrandActionsCellProps) {
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
          className='h-8 px-2.5 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
          onClick={() => {
            setOpenDelete(true)
          }}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      <EditBrandDialog open={openEdit} onOpenChange={setOpenEdit} brand={brand} />
      <DeleteBrandDialog open={openDelete} onOpenChange={setOpenDelete} brand={brand} />
    </>
  )
}
