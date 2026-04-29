import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addDays, differenceInDays, format } from 'date-fns'
import { RotateCcwSquare, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { IMGAE_NOT_FOUND } from '@/defines/upload-image'
import { useAppMutation } from '@/hooks/useAppMutation'
import { useFetchData } from '@/hooks/useFetchData'
import type { ArticleResponse } from '@/services/article/article.type'
import { getAdminTrashArticlesApi, restoreArticleApi } from '@/services/article/article.api'
import { HardDeleteArticleDialog } from './HardDeleteArticleDialog'

export function TrashArticleDialog() {
  const { t } = useTranslation('article')

  // Lấy dữ liệu thùng rác
  const { data = [] } = useFetchData('articles-trash', getAdminTrashArticlesApi)

  // Hook Restore gọi API và refresh lại cả danh sách chính + thùng rác
  const mutation = useAppMutation(
    (articleId: string) => restoreArticleApi(articleId),
    ['articles', 'articles-trash'],
    t('message.success.restore'),
    t('message.error.restore')
  )

  const [selectedArticle, setSelectedArticle] = useState<ArticleResponse | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='default'>
            <Trash2 />
          </Button>
        </DialogTrigger>

        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>{t('titles.trash')}</DialogTitle>
          </DialogHeader>

          <div className='mt-4 border rounded-md overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted'>
                <tr>
                  <th className='text-left p-3 w-1/2'>{t('table.columns.title')}</th>
                  <th className='text-left p-3 w-1/4'>{t('fields.deletedAt')}</th>
                  <th className='text-center p-3 w-1/4'>{t('table.columns.actions')}</th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-center p-4'>
                      {t('trash.trashEmpty')}
                    </td>
                  </tr>
                ) : (
                  data.map((article) => (
                    <tr key={article.id} className='border-t'>
                      <td className='p-3'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={article.thumbnail ?? IMGAE_NOT_FOUND}
                            alt={article.title}
                            className='h-10 w-16 rounded border object-cover shrink-0'
                          />
                          <div className='flex flex-col overflow-hidden'>
                            <span className='font-medium truncate' title={article.title}>
                              {article.title}
                            </span>
                            <span className='text-xs text-muted-foreground truncate'>
                              {article.authorName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className='p-3'>
                        {article.deletedAt &&
                          (() => {
                            const deletedDate = new Date(article.deletedAt)
                            const expiredDate = addDays(deletedDate, 30) // Tự động xóa sau 30 ngày
                            const remainingDays = differenceInDays(expiredDate, new Date())

                            return (
                              <div className='flex flex-col'>
                                <span>{format(deletedDate, 'dd/MM/yyyy HH:mm')}</span>
                                <span
                                  className={`text-xs ${remainingDays <= 5 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
                                >
                                  {t('trash.remainingDays', {
                                    days: remainingDays > 0 ? remainingDays : 0
                                  })}
                                </span>
                              </div>
                            )
                          })()}
                      </td>

                      <td className='p-3 text-center space-x-2'>
                        {/* Nút Khôi phục */}
                        <Button
                          size='sm'
                          variant='secondary'
                          title={t('actions.restore')}
                          onClick={() => mutation.mutate(article.id)}
                          disabled={mutation.isPending}
                        >
                          <RotateCcwSquare size={18} />
                        </Button>

                        {/* Nút Xóa cứng */}
                        <Button
                          size='sm'
                          variant='destructive'
                          title={t('actions.hardDelete')}
                          onClick={() => {
                            setSelectedArticle(article)
                            setOpenDelete(true)
                          }}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gọi Dialog Xóa cứng */}
      {selectedArticle && (
        <HardDeleteArticleDialog
          open={openDelete}
          onOpenChange={setOpenDelete}
          article={selectedArticle}
        />
      )}
    </>
  )
}
