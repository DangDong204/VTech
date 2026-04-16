import { HardDeleteTagDialog } from '@/components/admin/data/manage-tag/trash/HardDeleteTagDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useAppMutation } from '@/hooks/useAppMutation'
import { useFetchData } from '@/hooks/useFetchData'
import type { Tag } from '@/pages/admin/manage-tag/columns'
import { getAllTagInTrashApi, restoreTagApi } from '@/services/tag/tag.api'
import { addDays, differenceInDays, format } from 'date-fns'
import { RotateCcwSquare, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function TrashTagDialog() {
  const { t } = useTranslation('tag')

  const { data = [] } = useFetchData('tags-trash', getAllTagInTrashApi)

  const mutation = useAppMutation(
    (tagId: string) => restoreTagApi(tagId),
    ['tags', 'tags-trash'],
    t('message.success.restore'),
    t('message.error.restore')
  )

  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
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
                  <th className='text-left p-3 w-1/3'>{t('table.columns.tag')}</th>
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
                  data.map((tag) => (
                    <tr key={tag.id} className='border-t'>
                      <td className='p-3'>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{tag.tagName}</span>
                          {/* <span className='text-xs text-muted-foreground'>{tag.slug}</span> */}
                        </div>
                      </td>

                      <td className='p-3'>
                        {tag.deletedAt &&
                          (() => {
                            const deletedDate = new Date(tag.deletedAt)
                            const expiredDate = addDays(deletedDate, 30)
                            const remainingDays = differenceInDays(expiredDate, new Date())

                            return (
                              <div className='flex flex-col'>
                                <span>{format(deletedDate, 'dd/MM/yyyy HH:mm')}</span>
                                <span className='text-xs text-muted-foreground'>
                                  {t('trash.remainingDays', {
                                    days: remainingDays
                                  })}
                                </span>
                              </div>
                            )
                          })()}
                      </td>

                      <td className='p-3 text-center space-x-2'>
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() => mutation.mutate(tag.id)}
                          disabled={mutation.isPending}
                        >
                          <RotateCcwSquare size={18} />
                        </Button>

                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => {
                            setSelectedTag(tag)
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

      {selectedTag && (
        <HardDeleteTagDialog open={openDelete} onOpenChange={setOpenDelete} tag={selectedTag} />
      )}
    </>
  )
}
