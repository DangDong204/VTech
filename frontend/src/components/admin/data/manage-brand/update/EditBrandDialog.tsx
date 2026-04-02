import { EditBrandForm } from '@/components/admin/data/manage-brand/update/EditBrandForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Brand } from '@/pages/admin/manage-brand/columns'
import { useTranslation } from 'react-i18next'

interface EditBrandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: Brand
}

export function EditBrandDialog({ open, onOpenChange, brand }: EditBrandDialogProps) {
  const { t } = useTranslation('brand')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('titles.edit')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <EditBrandForm brand={brand} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
