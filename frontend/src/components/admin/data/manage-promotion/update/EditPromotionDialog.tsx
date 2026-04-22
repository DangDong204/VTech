import { EditPromotionForm } from '@/components/admin/data/manage-promotion/update/EditPromotionForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { useTranslation } from 'react-i18next'

interface EditPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion: PromotionResponse
}

export function EditPromotionDialog({ open, onOpenChange, promotion }: EditPromotionDialogProps) {
  const { t } = useTranslation('promotion')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[1260px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('titles.edit')}</DialogTitle>
        </DialogHeader>
        <div className='max-h-[85vh] overflow-y-auto px-6 pb-6'>
          <EditPromotionForm promotion={promotion} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
