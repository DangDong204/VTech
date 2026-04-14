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
import { useAppMutation } from '@/hooks/useAppMutation'
import i18n from '@/i18n/i18n'
import type { Tag } from '@/pages/admin/manage-tag/columns'
import { deleteHardTagApi } from '@/services/tag/tag.api'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HardDeleteTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: Tag
}

export function HardDeleteTagDialog({ open, onOpenChange, tag }: HardDeleteTagDialogProps) {
  const { t } = useTranslation('tag')

  const mutation = useAppMutation(
    () => deleteHardTagApi(tag.id),
    'tags-trash',
    t('message.success.delete'),
    t('message.error.delete')
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('titles.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.confirm.hardDelete', {
              tagName: tag.tagName
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{i18n.t('common:common.cancel')}</AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              variant='destructive'
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              <Trash2 className='h-4 w-4' />
              {t('actions.confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
