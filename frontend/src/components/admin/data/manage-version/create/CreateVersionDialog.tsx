import { CreateVersionForm } from '@/components/admin/data/manage-version/create/CreateVersionForm'
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

export function CreateVersionDialog() {
  const { t } = useTranslation('version')

  const [openCreate, setOpenCreate] = useState(false)

  return (
    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
      <DialogTrigger asChild>
        <Button className=''>
          <Plus className='mr-2 h-4 w-4' />
          {t('actions.create')}
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <CreateVersionForm onSuccess={() => setOpenCreate(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
