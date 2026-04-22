import { CreateManualReceiptForm } from '@/components/admin/data/manage-receipt/create/CreateManualReceiptForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function CreateManualReceiptDialog() {
  const { t } = useTranslation('receipt')
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          {t('actions.create')}
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-5xl p-0'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b bg-muted/20'>
          <DialogTitle>{t('titles.create')} (Thủ công)</DialogTitle>
        </DialogHeader>
        <div className='px-6 pb-6 pt-4'>
          <CreateManualReceiptForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
