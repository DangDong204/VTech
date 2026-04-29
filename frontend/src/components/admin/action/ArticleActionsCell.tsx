import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { deleteSoftArticleApi } from '@/services/article/article.api'
import type { ArticleResponse } from '@/services/article/article.type'
import { EditArticleDialog } from '@/components/admin/data/manage-article/edit/EditArticleDialog'

interface ArticleActionsCellProps {
  article: ArticleResponse
}

export function ArticleActionsCell({ article }: ArticleActionsCellProps) {
  const { t } = useTranslation('article')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { mutate: softDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteSoftArticleApi(article.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['articles-trash'] })
      toast.success(t('message.success.deleted'))
      setDeleteDialogOpen(false) // Đóng dialog sau khi thành công
    },
    onError: () => {
      toast.error(t('message.error.delete'))
    }
  })

  return (
    <>
      <div className='flex items-center justify-center gap-1'>
        {/* View — điều hướng sang trang chi tiết */}
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={() => navigate(`/dashboard/articles/${article.id}`)}
          title={t('actions.view')}
        >
          <Eye className='h-4 w-4' />
        </Button>

        {/* Edit — mở dialog chỉnh sửa */}
        <EditArticleDialog articleId={article.id} />

        {/* Delete — Nút xóa mềm nằm trực tiếp bên ngoài */}
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
          onClick={() => setDeleteDialogOpen(true)}
          title={t('actions.delete')}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {/* Confirm delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.deleteConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('actions.deleteConfirm.description', { title: article.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('actions.deleteConfirm.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={isDeleting}
              onClick={() => softDelete()}
            >
              {isDeleting
                ? t('actions.deleteConfirm.deleting')
                : t('actions.deleteConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
