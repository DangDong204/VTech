import { DeleteProductDialog } from '@/components/admin/data/manage-product/delete/DeleteProductDialog'
import { ViewProductDialog } from '@/components/admin/data/manage-product/read/ViewProductDialog'
import { EditProductDialog } from '@/components/admin/data/manage-product/update/EditProductDialog'
import { Button } from '@/components/ui/button'
import type { Product } from '@/pages/admin/manage-product/columns'
import { Edit, Eye, Layers, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

interface ProductActionsCellProps {
  product: Product
}

export function ProductActionsCell({ product }: ProductActionsCellProps) {
  const [openView, setOpenView] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='ghost'
          size='default'
          className='h-8 px-2.5 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/20'
          asChild
          title='Quản lý biến thể'
        >
          <Link to={`/dashboard/products/${product.id}/variants`}>
            <Layers className='h-4 w-4' />
          </Link>
        </Button>

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

      <ViewProductDialog open={openView} onOpenChange={setOpenView} product={product} />
      <EditProductDialog open={openEdit} onOpenChange={setOpenEdit} product={product} />
      <DeleteProductDialog open={openDelete} onOpenChange={setOpenDelete} product={product} />
    </>
  )
}
