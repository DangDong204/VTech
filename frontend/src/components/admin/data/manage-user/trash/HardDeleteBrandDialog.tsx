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
import type { User } from '@/pages/admin/manage-user/columns'
import { deleteHardUserApi } from '@/services/user/user.api'

import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface HardDeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function HardDeleteUserDialog({ open, onOpenChange, user }: HardDeleteUserDialogProps) {
  const { t } = useTranslation('user')

  const mutation = useAppMutation(
    () => deleteHardUserApi(user.id),
    'users-trash',
    t('message.success.delete'),
    t('message.error.delete')
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogTitle.delete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('message.confirm.hardDelete', {
              email: user.email
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
