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
import type { Color } from '@/pages/admin/manage-color/columns'
import { deleteColorApi } from '@/services/color/color.api'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DeleteColorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  color: Color
}

export function DeleteColorDialog({ open, onOpenChange, color }: DeleteColorDialogProps) {
  const { t } = useTranslation('color')

  const mutation = useAppMutation(
    () => deleteColorApi(color.id),
    'colors',
    t('message.success.delete'),
    t('message.error.delete'),
    () => onOpenChange(false)
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('titles.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.confirm.delete', { colorName: color.colorName })}
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
              <Trash2 className='mr-2 h-4 w-4' />
              {t('actions.confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
