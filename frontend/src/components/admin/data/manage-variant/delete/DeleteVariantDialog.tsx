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
import { deleteVariantApi } from '@/services/product-variant/variant.api'
import type { ProductVariantResponse } from '@/services/product-variant/variant.type'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DeleteVariantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: ProductVariantResponse
}

export function DeleteVariantDialog({ open, onOpenChange, variant }: DeleteVariantDialogProps) {
  const { t } = useTranslation('variant')

  const mutation = useAppMutation(
    () => deleteVariantApi(variant.id),
    ['variants', variant.productId],
    t('message.success.delete'),
    t('message.error.delete'),
    () => onOpenChange(false)
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('titles.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.confirm.delete', { sku: variant.sku })}
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
              <Trash2 className='mr-2 h-4 w-4' />
              {t('actions.confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
