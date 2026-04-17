import { DeleteVersionDialog } from '@/components/admin/data/manage-version/delete/DeleteVersionDialog'
import { EditVersionDialog } from '@/components/admin/data/manage-version/update/EditVersionDialog'
import { Button } from '@/components/ui/button'
import type { VersionResponse } from '@/services/version/version.type'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface VersionActionsCellProps {
  version: VersionResponse
}

export function VersionActionsCell({ version }: VersionActionsCellProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-end gap-2 pr-4'>
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
          onClick={() => setOpenDelete(true)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {openEdit && (
        <EditVersionDialog open={openEdit} onOpenChange={setOpenEdit} version={version} />
      )}
      {openDelete && (
        <DeleteVersionDialog open={openDelete} onOpenChange={setOpenDelete} version={version} />
      )}
    </>
  )
}
