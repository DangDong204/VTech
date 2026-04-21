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
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { deleteSoftPromotionApi } from '@/services/promotion/promotion.api'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DeletePromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion: PromotionResponse
}

export function DeletePromotionDialog({
  open,
  onOpenChange,
  promotion
}: DeletePromotionDialogProps) {
  const { t } = useTranslation('promotion')

  const mutation = useAppMutation(
    () => deleteSoftPromotionApi(promotion.id),
    ['promotions', 'promotions-trash'], // Cập nhật lại list chính và list thùng rác
    t('message.success.softDelete'),
    t('message.error.softDelete')
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('titles.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.confirm.softDelete', { promotionName: promotion.promotionName })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            {i18n.t('common:common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              onClick={(e) => {
                e.preventDefault()
                mutation.mutate(undefined, {
                  onSuccess: () => onOpenChange(false)
                })
              }}
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
