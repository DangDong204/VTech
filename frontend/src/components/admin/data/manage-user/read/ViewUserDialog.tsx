import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { User } from '@/pages/admin/manage-user/columns'
import { useTranslation } from 'react-i18next'
import { UserRoleBadges } from '@/components/admin/data/manage-user/UserRoleBadges'
import { UserStatusBadge } from '@/components/admin/data/manage-user/UserStatusBadges'
import type { UserRole } from '@/defines/user.enum'

interface ViewUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function ViewUserDialog({ open, onOpenChange, user }: ViewUserDialogProps) {
  const { t } = useTranslation('user')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('dialogTitle.view')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <Card className='border-none shadow-none'>
            <CardHeader className='pb-2'>
              <div className='flex items-center gap-3'>
                <img
                  src={user.avatar ?? 'https://ui.shadcn.com/avatars/02.png'}
                  className='h-12 w-12 rounded-full border'
                />
                <div>
                  <p className='font-medium'>{user.username}</p>
                  <p className='text-sm text-muted-foreground'>{user.email}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className='space-y-6'>
              <div className='space-y-3'>
                <h3 className='font-medium'>{t('create.sections.personal')}</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Info label={t('fields.fullName.label')} value={user.fullName} />
                  <Info label={t('fields.phone.label')} value={user.phone} />
                </div>
              </div>

              <Separator />

              <div className='space-y-3'>
                <h3 className='font-medium'>{t('create.sections.account')}</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    <Label className='text-muted-foreground'>{t('fields.role.label')}</Label>
                    <UserRoleBadges roles={user.roles as UserRole[]} />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-muted-foreground block mb-1'>
                      {t('fields.status.label')}
                    </Label>
                    <UserStatusBadge status={user.status} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground'>
                <Info label={t('fields.createdAt')} value={user.createdAt} />
                <Info label={t('fields.updatedAt')} value={user.updatedAt} />
              </div>

              <div className='flex justify-end pt-4'>
                <Button variant='outline' onClick={() => onOpenChange(false)}>
                  {t('actions.close')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className='space-y-1'>
      <Label className='text-muted-foreground'>{label}</Label>
      <p className='font-medium'>{value || '-'}</p>
    </div>
  )
}
