import { CreateVoucherForm } from '@/components/admin/data/manage-voucher/create/CreateVoucherForm'
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

export function CreateVoucherDialog() {
  const { t } = useTranslation('voucher')

  const [openCreate, setOpenCreate] = useState(false)

  return (
    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          {t('actions.create')}
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[750px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle className='sr-only'>{t('actions.create')}</DialogTitle>
        </DialogHeader>
        {/* max-h-[85vh] giúp form cuộn mượt mà trên màn hình nhỏ */}
        <div className='max-h-[85vh] overflow-y-auto px-6 pb-6'>
          <CreateVoucherForm onSuccess={() => setOpenCreate(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
