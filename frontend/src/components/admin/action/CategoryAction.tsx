import { Button } from '@/components/ui/button'
import type { Category } from '@/pages/admin/manage-category/columns'
import { Edit, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ViewCategoryDialog } from '@/components/admin/data/manage-category/read/ViewCategoryDialog'
import { EditCategoryDialog } from '@/components/admin/data/manage-category/update/EditCategoryDialog'
// import { DeleteCategoryDialog } from '@/components/admin/data/manage-category/DeleteCategoryDialog'

interface CategoryActionsCellProps {
  category: Category
}

export function CategoryActionsCell({ category }: CategoryActionsCellProps) {
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
          onClick={() => {
            setOpenView(true)
          }}
        >
          <Eye className='h-4 w-4' />
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

      <ViewCategoryDialog open={openView} onOpenChange={setOpenView} category={category} />
      <EditCategoryDialog open={openEdit} onOpenChange={setOpenEdit} category={category} />
      {/* <DeleteCategoryDialog open={openDelete} onOpenChange={setOpenDelete} category={category} /> */}
    </>
  )
}
