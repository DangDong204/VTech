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
import { useAppMutation } from '@/hooks/useAppMutation'
import type { ArticleResponse } from '@/services/article/article.type'
import { deleteHardArticleApi } from '@/services/article/article.api'
import { useTranslation } from 'react-i18next'

interface HardDeleteArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article: ArticleResponse
}

export function HardDeleteArticleDialog({
  open,
  onOpenChange,
  article
}: HardDeleteArticleDialogProps) {
  const { t } = useTranslation('article')

  const mutation = useAppMutation(
    (id: string) => deleteHardArticleApi(id),
    ['articles-trash'], // Refresh lại Thùng rác sau khi xóa
    t('message.success.hardDelete'),
    t('message.error.hardDelete')
  )

  const handleConfirm = () => {
    mutation.mutate(article.id, {
      onSuccess: () => onOpenChange(false)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-destructive'>
            {t('actions.hardDeleteConfirm.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('actions.hardDeleteConfirm.description', { title: article.title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={mutation.isPending}
            onClick={handleConfirm}
          >
            {mutation.isPending
              ? t('actions.hardDeleteConfirm.deleting')
              : t('actions.hardDeleteConfirm.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
