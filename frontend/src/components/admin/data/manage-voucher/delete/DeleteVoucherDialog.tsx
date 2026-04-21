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
import { deleteSoftVoucherApi } from '@/services/voucher/voucher.api'
import type { VoucherResponse } from '@/services/voucher/voucher.type'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DeleteVoucherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucher: VoucherResponse
}

export function DeleteVoucherDialog({ open, onOpenChange, voucher }: DeleteVoucherDialogProps) {
  const { t } = useTranslation('voucher')

  const mutation = useAppMutation(
    () => deleteSoftVoucherApi(voucher.id),
    ['vouchers', 'vouchers-trash'],
    t('message.success.softDelete'),
    t('message.error.softDelete')
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('titles.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.confirm.softDelete', { voucherCode: voucher.voucherCode })}
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
