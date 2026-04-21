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
import { deleteHardVoucherApi } from '@/services/voucher/voucher.api'
import type { VoucherResponse } from '@/services/voucher/voucher.type'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HardDeleteVoucherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucher: VoucherResponse
}

export function HardDeleteVoucherDialog({
  open,
  onOpenChange,
  voucher
}: HardDeleteVoucherDialogProps) {
  const { t } = useTranslation('voucher')

  const mutation = useAppMutation(
    () => deleteHardVoucherApi(voucher.id),
    'vouchers-trash',
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
              voucherCode: voucher.voucherCode
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
