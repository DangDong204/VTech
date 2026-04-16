import { EditTagForm } from '@/components/admin/data/manage-tag/update/EditTagForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Tag } from '@/pages/admin/manage-tag/columns'
import { useTranslation } from 'react-i18next'

interface EditTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: Tag
}

export function EditTagDialog({ open, onOpenChange, tag }: EditTagDialogProps) {
  const { t } = useTranslation('tag')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('titles.edit')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <EditTagForm tag={tag} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
