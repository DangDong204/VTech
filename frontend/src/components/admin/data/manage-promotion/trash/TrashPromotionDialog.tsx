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
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { getAllPromotionInTrashApi, restorePromotionApi } from '@/services/promotion/promotion.api'
import { addDays, differenceInDays, format } from 'date-fns'
import { RotateCcwSquare, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HardDeletePromotionDialog } from '@/components/admin/data/manage-promotion/trash/HardDeletePromotionDialog'

export function TrashPromotionDialog() {
  const { t } = useTranslation('promotion')

  const { data = [] } = useFetchData('promotions-trash', getAllPromotionInTrashApi)

  const mutation = useAppMutation(
    (promotionId: string) => restorePromotionApi(promotionId),
    ['promotions', 'promotions-trash'],
    t('message.success.restore'),
    t('message.error.restore')
  )

  const [selectedPromotion, setSelectedPromotion] = useState<PromotionResponse | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='default'>
            <Trash2 className='w-4 h-4' />
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
                  <th className='text-left p-3 w-1/3'>{t('table.columns.promotionName')}</th>
                  <th className='text-left p-3 w-1/3'>{t('fields.deletedAt')}</th>
                  <th className='text-center p-3 w-1/4'>{t('table.columns.actions')}</th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='text-center p-6 text-muted-foreground'>
                      {t('trash.trashEmpty')}
                    </td>
                  </tr>
                ) : (
                  data.map((promotion) => (
                    <tr key={promotion.id} className='border-t hover:bg-muted/50 transition-colors'>
                      <td className='p-3'>
                        <div className='flex flex-col'>
                          <span className='font-bold text-primary'>{promotion.promotionName}</span>
                          <span className='text-xs text-muted-foreground line-clamp-1'>
                            {promotion.promotionDesc}
                          </span>
                        </div>
                      </td>

                      <td className='p-3'>
                        {promotion.deletedAt &&
                          (() => {
                            const deletedDate = new Date(promotion.deletedAt)
                            const expiredDate = addDays(deletedDate, 30)
                            const remainingDays = differenceInDays(expiredDate, new Date())

                            return (
                              <div className='flex flex-col'>
                                <span>{format(deletedDate, 'dd/MM/yyyy HH:mm')}</span>
                                <span className='text-xs text-muted-foreground'>
                                  {t('trash.remainingDays', {
                                    days: remainingDays > 0 ? remainingDays : 0
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
                          title='Khôi phục'
                          onClick={() => mutation.mutate(promotion.id)}
                          disabled={mutation.isPending}
                        >
                          <RotateCcwSquare size={16} />
                        </Button>

                        <Button
                          size='sm'
                          variant='destructive'
                          title='Xóa vĩnh viễn'
                          onClick={() => {
                            setSelectedPromotion(promotion)
                            setOpenDelete(true)
                          }}
                        >
                          <Trash2 size={16} />
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

      {selectedPromotion && (
        <HardDeletePromotionDialog
          open={openDelete}
          onOpenChange={setOpenDelete}
          promotion={selectedPromotion}
        />
      )}
    </>
  )
}
