import { DeleteColorDialog } from '@/components/admin/data/manage-color/delete/DeleteColorDialog'
import { EditColorDialog } from '@/components/admin/data/manage-color/update/EditColorDialog'
import { Button } from '@/components/ui/button'
import type { Color } from '@/pages/admin/manage-color/columns'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ColorActionsCellProps {
  color: Color
}

export function ColorActionsCell({ color }: ColorActionsCellProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-end gap-2 pr-10'>
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

      <EditColorDialog open={openEdit} onOpenChange={setOpenEdit} color={color} />
      <DeleteColorDialog open={openDelete} onOpenChange={setOpenDelete} color={color} />
    </>
  )
}
