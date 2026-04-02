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
import type { Brand } from '@/pages/admin/manage-brand/columns'
import { deleteSoftBrandApi } from '@/services/brand/brand.api'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DeleteBrandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: Brand
}

export function DeleteBrandDialog({ open, onOpenChange, brand }: DeleteBrandDialogProps) {
  const { t } = useTranslation('brand')

  const mutation = useAppMutation(
    () => deleteSoftBrandApi(brand.id),
    ['brands', 'brands-trash'],
    t('message.success.softDelete'),
    t('message.error.softDelete')
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('titles.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.confirm.softDelete', { brandName: brand.brandName })}
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
              <Trash2 className=' h-4 w-4' />
              {t('actions.confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
