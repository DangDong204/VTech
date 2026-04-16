import { HardDeleteProductDialog } from '@/components/admin/data/manage-product/trash/HardDeleteProductDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { IMGAE_NOT_FOUND } from '@/defines/upload-image'
import { useAppMutation } from '@/hooks/useAppMutation'
import { useFetchData } from '@/hooks/useFetchData'
import type { Product } from '@/pages/admin/manage-product/columns'
import { getAllProductInTrashApi, restoreProductApi } from '@/services/product/product.api'
import { addDays, differenceInDays, format } from 'date-fns'
import { RotateCcwSquare, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function TrashProductDialog() {
  const { t } = useTranslation('product')

  const { data = [] } = useFetchData('products-trash', getAllProductInTrashApi)

  const mutation = useAppMutation(
    (productId: string) => restoreProductApi(productId),
    ['products', 'products-trash'],
    t('message.success.restore'),
    t('message.error.restore')
  )

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='default'>
            <Trash2 />
          </Button>
        </DialogTrigger>

        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>{t('titles.trash')}</DialogTitle>
          </DialogHeader>

          <div className='mt-4 border rounded-md overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted'>
                <tr>
                  <th className='text-left p-3 w-1/3'>{t('table.columns.product')}</th>
                  <th className='text-left p-3 w-1/3'>{t('fields.deletedAt')}</th>
                  <th className='text-center p-3 w-1/4'>{t('table.columns.actions')}</th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-center p-4'>
                      {t('trash.trashEmpty')}
                    </td>
                  </tr>
                ) : (
                  data.map((product) => (
                    <tr key={product.id} className='border-t'>
                      <td className='p-3'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={product.images?.thumbnail ?? IMGAE_NOT_FOUND}
                            alt={product.productName}
                            className='h-10 w-10 rounded-full border object-cover'
                          />

                          <div className='flex flex-col'>
                            <span className='font-medium'>{product.productName}</span>
                            <span className='text-xs text-muted-foreground'>{product.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className='p-3'>
                        {product.deletedAt &&
                          (() => {
                            const deletedDate = new Date(product.deletedAt)
                            const expiredDate = addDays(deletedDate, 30)
                            const remainingDays = differenceInDays(expiredDate, new Date())

                            return (
                              <div className='flex flex-col'>
                                <span>{format(deletedDate, 'dd/MM/yyyy HH:mm')}</span>
                                <span className='text-xs text-muted-foreground'>
                                  {t('trash.remainingDays', {
                                    days: remainingDays
                                  })}
                                </span>
                              </div>
                            )
                          })()}
                      </td>

                      <td className='p-3 text-center space-x-2'>
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() => mutation.mutate(product.id)}
                          disabled={mutation.isPending}
                        >
                          <RotateCcwSquare size={18} />
                        </Button>

                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => {
                            setSelectedProduct(product)
                            setOpenDelete(true)
                          }}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {selectedProduct && (
        <HardDeleteProductDialog
          open={openDelete}
          onOpenChange={setOpenDelete}
          product={selectedProduct}
        />
      )}
    </>
  )
}
