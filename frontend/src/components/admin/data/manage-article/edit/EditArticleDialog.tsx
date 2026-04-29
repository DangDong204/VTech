import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreateArticleForm } from '@/components/admin/data/manage-article/create/CreateArticleForm'
import { useUpdateArticle } from '@/services/article/article.mutation'
import { getAdminArticleByIdApi } from '@/services/article/article.api'
import type { CreateArticlePayload } from '@/services/article/article.type'
import { ArticleStatus } from '@/defines/enum/article.enum'

interface EditArticleDialogProps {
  articleId: string
}

export function EditArticleDialog({ articleId }: EditArticleDialogProps) {
  const { t } = useTranslation('article')
  const [open, setOpen] = useState(false)

  // Chỉ fetch khi dialog mở
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => getAdminArticleByIdApi(articleId),
    enabled: open
  })

  const { mutate, isPending } = useUpdateArticle(articleId, () => setOpen(false))

  const handleSubmit = (data: CreateArticlePayload) => {
    mutate(data)
  }

  // Tự động map dữ liệu từ Backend vào Form
  const defaultValues = article
    ? {
        title: article.title,
        summary: article.summary ?? '',
        content: article.content,
        status: article.status as ArticleStatus,
        thumbnail: article.thumbnail ?? null,
        // Backend trả về mảng object products, ta bóc tách lấy mảng ID để truyền vào form
        productIds: article.products?.map((p) => p.id) ?? []
      }
    : undefined

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-primary hover:text-primary hover:bg-primary/10'
        >
          <Pencil className='h-4 w-4' />
        </Button>
      </DialogTrigger>

      {/* Áp dụng giao diện siêu rộng giống Create */}
      <DialogContent className='max-h-[95vh] max-w-7xl overflow-y-auto p-0 gap-0'>
        <DialogHeader className='p-6 border-b bg-muted/20'>
          <DialogTitle className='text-xl font-bold'>{t('titles.edit')}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
              <span>Đang tải dữ liệu bài viết...</span>
            </div>
          </div>
        ) : (
          <div className='p-6'>
            <CreateArticleForm
              key={articleId} // reset form khi articleId thay đổi
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              isLoading={isPending}
              submitLabel={t('form.submitEdit')}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
