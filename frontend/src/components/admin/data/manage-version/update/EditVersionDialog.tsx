import { EditVersionForm } from '@/components/admin/data/manage-version/update/EditVersionForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Version } from '@/pages/admin/manage-version/columns'
import { useTranslation } from 'react-i18next'

interface EditVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  version: Version
}

export function EditVersionDialog({ open, onOpenChange, version }: EditVersionDialogProps) {
  const { t } = useTranslation('version')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('titles.edit')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <EditVersionForm version={version} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
