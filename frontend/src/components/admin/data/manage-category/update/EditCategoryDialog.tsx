import { EditCategoryForm } from '@/components/admin/data/manage-category/update/EditCategoryForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Category } from '@/pages/admin/manage-category/columns'
import { useTranslation } from 'react-i18next'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category
}

export function EditCategoryDialog({ open, onOpenChange, category }: EditUserDialogProps) {
  const { t } = useTranslation('category')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('titles.edit')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <EditCategoryForm category={category} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
