import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllUserInTrashApi, restoreUserApi } from '@/services/user/user.api'
import { RotateCcwSquare, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { addDays, differenceInDays, format } from 'date-fns'
import { useAppMutation } from '@/hooks/useAppMutation'
import type { User } from '@/pages/admin/manage-user/columns'
import { useState } from 'react'
import { HardDeleteUserDialog } from '@/components/admin/data/manage-user/trash/HardDeleteBrandDialog'

export function TrashUserDialog() {
  const { t } = useTranslation('user')

  const { data = [] } = useFetchData('users-trash', getAllUserInTrashApi)

  const mutation = useAppMutation(
    (userId: string) => restoreUserApi(userId),
    ['users', 'users-trash'],
    t('message.success.restore'),
    t('message.error.restore')
  )

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
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
            <DialogTitle>{t('trash.trashEmpty')}</DialogTitle>
          </DialogHeader>

          <div className='mt-4 border rounded-md overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted'>
                <tr>
                  <th className='text-left p-3 w-1/3'>{t('table.columns.user')}</th>
                  <th className='text-left p-3 w-1/3'>{t('fields.deletedAt')}</th>
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
                  data.map((user) => (
                    <tr key={user.id} className='border-t'>
                      <td className='p-3'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={user.avatar ?? 'https://ui.shadcn.com/avatars/02.png'}
                            alt={user.username}
                            className='h-10 w-10 rounded-full border object-cover'
                          />

                          <div className='flex flex-col'>
                            <span className='font-medium'>{user.username}</span>
                            <span className='text-xs text-muted-foreground'>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className='p-3'>
                        {user.deletedAt &&
                          (() => {
                            const deletedDate = new Date(user.deletedAt)
                            const expiredDate = addDays(deletedDate, 30)
                            const remainingDays = differenceInDays(expiredDate, new Date())

                            return (
                              <div className='flex flex-col'>
                                <span>{format(deletedDate, 'dd/MM/yyyy HH:mm')}</span>
                                {
                                  <span className='text-xs text-muted-foreground'>
                                    {t('trash.remainingDays', { days: remainingDays })}
                                  </span>
                                }
                              </div>
                            )
                          })()}
                      </td>

                      <td className='p-3 text-center space-x-2'>
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() => mutation.mutate(user.id)}
                          disabled={mutation.isPending}
                        >
                          <RotateCcwSquare size={18} />
                        </Button>

                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => {
                            setSelectedUser(user)
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
      {selectedUser && (
        <HardDeleteUserDialog open={openDelete} onOpenChange={setOpenDelete} user={selectedUser} />
      )}
    </>
  )
}
