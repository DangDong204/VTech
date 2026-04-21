import { EditVoucherForm } from '@/components/admin/data/manage-voucher/update/EditVoucherForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { VoucherResponse } from '@/services/voucher/voucher.type'
import { useTranslation } from 'react-i18next'

interface EditVoucherDialogProps {
  voucher: VoucherResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVoucherDialog({ voucher, open, onOpenChange }: EditVoucherDialogProps) {
  const { t } = useTranslation('voucher')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[750px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle className='sr-only'>{t('titles.edit')}</DialogTitle>
        </DialogHeader>
        <div className='max-h-[85vh] overflow-y-auto px-6 pb-6'>
          <EditVoucherForm voucher={voucher} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
