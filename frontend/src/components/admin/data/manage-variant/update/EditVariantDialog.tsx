import { EditVariantForm } from '@/components/admin/data/manage-variant/update/EditVariantForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ProductVariantResponse } from '@/services/product-variant/variant.type'
import { useTranslation } from 'react-i18next'

interface EditVariantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: ProductVariantResponse
}

export function EditVariantDialog({ open, onOpenChange, variant }: EditVariantDialogProps) {
  const { t } = useTranslation('variant')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[900px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('titles.edit')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <EditVariantForm variant={variant} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
