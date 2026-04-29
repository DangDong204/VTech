import { useState } from 'react'
import { PenLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreateArticleForm } from './CreateArticleForm'
import { useCreateArticle } from '@/services/article/article.mutation'
import type { CreateArticlePayload } from '@/services/article/article.type'

export function CreateArticleDialog() {
  const { t } = useTranslation('article')
  const [open, setOpen] = useState(false)

  const { mutate, isPending } = useCreateArticle(() => setOpen(false))

  const handleSubmit = (data: CreateArticlePayload) => {
    mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='ml-auto gap-1.5'>
          <PenLine className='h-4 w-4' />
          {t('titles.create')}
        </Button>
      </DialogTrigger>

      {/* TĂNG LÊN max-w-7xl (1280px) để form siêu rộng rãi */}
      <DialogContent className='max-h-[95vh] max-w-7xl overflow-y-auto p-0 gap-0'>
        <DialogHeader className='p-6 border-b bg-muted/20'>
          <DialogTitle className='text-xl font-bold'>{t('titles.create')}</DialogTitle>
        </DialogHeader>

        <div className='p-6'>
          <CreateArticleForm
            onSubmit={handleSubmit}
            isLoading={isPending}
            submitLabel={t('form.submit')}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
