import { EditColorForm } from '@/components/admin/data/manage-color/update/EditColorForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Color } from '@/pages/admin/manage-color/columns'
import { useTranslation } from 'react-i18next'

interface EditColorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  color: Color
}

export function EditColorDialog({ open, onOpenChange, color }: EditColorDialogProps) {
  const { t } = useTranslation('color')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('titles.edit')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <EditColorForm color={color} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
