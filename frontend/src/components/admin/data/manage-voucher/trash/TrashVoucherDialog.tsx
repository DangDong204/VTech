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
import type { VoucherResponse } from '@/services/voucher/voucher.type'
import { getAllVoucherInTrashApi, restoreVoucherApi } from '@/services/voucher/voucher.api'
import { addDays, differenceInDays, format } from 'date-fns'
import { RotateCcwSquare, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HardDeleteVoucherDialog } from '@/components/admin/data/manage-voucher/trash/HardDeleteCategoryDialog'

export function TrashVoucherDialog() {
  const { t } = useTranslation('voucher')

  const { data = [] } = useFetchData('vouchers-trash', getAllVoucherInTrashApi)

  const mutation = useAppMutation(
    (voucherId: string) => restoreVoucherApi(voucherId),
    ['vouchers', 'vouchers-trash'],
    t('message.success.restore'),
    t('message.error.restore')
  )

  const [selectedVoucher, setSelectedVoucher] = useState<VoucherResponse | null>(null)
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
                  <th className='text-left p-3 w-1/3'>{t('table.columns.voucherName')}</th>
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
                  data.map((voucher) => (
                    <tr key={voucher.id} className='border-t hover:bg-muted/50 transition-colors'>
                      <td className='p-3'>
                        <div className='flex flex-col'>
                          <span className='font-bold text-primary'>{voucher.voucherCode}</span>
                          <span className='text-xs text-muted-foreground line-clamp-1'>
                            {voucher.voucherName}
                          </span>
                        </div>
                      </td>

                      <td className='p-3'>
                        {voucher.deletedAt &&
                          (() => {
                            const deletedDate = new Date(voucher.deletedAt)
                            const expiredDate = addDays(deletedDate, 30) // Giữ 30 ngày
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
                          onClick={() => mutation.mutate(voucher.id)}
                          disabled={mutation.isPending}
                        >
                          <RotateCcwSquare size={16} />
                        </Button>

                        <Button
                          size='sm'
                          variant='destructive'
                          title='Xóa vĩnh viễn'
                          onClick={() => {
                            setSelectedVoucher(voucher)
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

      {selectedVoucher && (
        <HardDeleteVoucherDialog
          open={openDelete}
          onOpenChange={setOpenDelete}
          voucher={selectedVoucher}
        />
      )}
    </>
  )
}
