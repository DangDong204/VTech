import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useAppMutation } from '@/hooks/useAppMutation'
import i18n from '@/i18n/i18n'
import type { Product } from '@/pages/admin/manage-product/columns'
import { deleteHardProductApi } from '@/services/product/product.api'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HardDeleteProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
}

export function HardDeleteProductDialog({
  open,
  onOpenChange,
  product
}: HardDeleteProductDialogProps) {
  const { t } = useTranslation('product')

  const mutation = useAppMutation(
    () => deleteHardProductApi(product.id),
    'products-trash',
    t('message.success.delete'),
    t('message.error.delete')
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('titles.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.confirm.hardDelete', {
              productName: product.productName
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{i18n.t('common:common.cancel')}</AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              <Trash2 className='h-4 w-4' />
              {t('actions.confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
