import { ReceiptStatusBadge } from '@/components/admin/data/manage-receipt/ReceiptStatusBadge'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ReceiptStatus } from '@/defines/enum/receipt.enum'
import { useAppMutation } from '@/hooks/useAppMutation'
import i18n from '@/i18n/i18n'
import { cancelReceiptApi, completeReceiptApi } from '@/services/receipt/receipt.api'
import type { ReceiptResponse } from '@/services/receipt/receipt.type'
import { CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ViewReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: ReceiptResponse
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export function ViewReceiptDialog({ open, onOpenChange, receipt }: ViewReceiptDialogProps) {
  const { t } = useTranslation('receipt')

  // States quản lý Dialog Xác nhận
  const [openConfirmApprove, setOpenConfirmApprove] = useState(false)
  const [openConfirmCancel, setOpenConfirmCancel] = useState(false)

  // Hook xử lý phê duyệt phiếu
  const approveMutation = useAppMutation(
    () => completeReceiptApi(receipt.id),
    'receipts',
    t('message.success.complete'),
    t('message.error.complete')
  )

  // Hook xử lý hủy phiếu
  const cancelMutation = useAppMutation(
    () => cancelReceiptApi(receipt.id),
    'receipts',
    t('message.success.cancel', 'Hủy phiếu thành công!'),
    t('message.error.cancel', 'Hủy phiếu thất bại!')
  )

  const handleConfirmApprove = (e: React.MouseEvent) => {
    e.preventDefault()
    approveMutation.mutate(undefined, {
      onSuccess: () => {
        setOpenConfirmApprove(false)
        onOpenChange(false)
      }
    })
  }

  const handleConfirmCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        setOpenConfirmCancel(false)
        onOpenChange(false)
      }
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-6xl p-0 overflow-hidden'>
          <DialogHeader className='px-6 pt-6 pb-4 border-b bg-muted/20'>
            <div className='flex items-center justify-between pr-6'>
              <DialogTitle className='text-xl'>
                {t('titles.view')} <span className='text-primary ml-2'>#{receipt.receiptCode}</span>
              </DialogTitle>
              <ReceiptStatusBadge status={receipt.status} />
            </div>
          </DialogHeader>

          <div className='max-h-[75vh] overflow-y-auto px-6 py-6'>
            {/* BỐ CỤC 2 CỘT: 4 - 8 */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
              {/* --- CỘT TRÁI: THÔNG TIN CHUNG (4 Cột) --- */}
              <div className='lg:col-span-4 space-y-6 bg-muted/10 p-5 rounded-lg border'>
                <h3 className='font-semibold text-primary/80 uppercase tracking-wider text-sm border-b pb-2'>
                  Thông tin chung
                </h3>

                <div className='space-y-4'>
                  <div className='space-y-1.5'>
                    <Label className='text-muted-foreground text-xs uppercase'>
                      {t('table.columns.supplier')}
                    </Label>
                    <p className='font-semibold text-base text-primary'>
                      {receipt.supplierName || 'Không có'}
                    </p>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                      <Label className='text-muted-foreground text-xs uppercase'>
                        {t('table.columns.createdBy')}
                      </Label>
                      <p className='font-medium text-sm'>{receipt.createdBy}</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                      <Label className='text-muted-foreground text-xs uppercase'>
                        {t('table.columns.createdAt')}
                      </Label>
                      <p className='font-medium text-sm'>{receipt.createdAt}</p>
                    </div>

                    {receipt.updatedAt && (
                      <div className='space-y-1.5'>
                        <Label className='text-muted-foreground text-xs uppercase'>
                          Ngày cập nhật
                        </Label>
                        <p className='font-medium text-sm text-blue-600'>{receipt.updatedAt}</p>
                      </div>
                    )}
                  </div>

                  <div className='space-y-1.5 pt-2'>
                    <Label className='text-muted-foreground text-xs uppercase'>
                      {t('fields.note.label')}
                    </Label>
                    <div className='bg-background border rounded-md p-3 text-sm min-h-[80px]'>
                      {receipt.note || (
                        <span className='text-muted-foreground italic'>Không có ghi chú</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- CỘT PHẢI: CHI TIẾT SẢN PHẨM NHẬP (8 Cột) --- */}
              <div className='lg:col-span-8 space-y-4'>
                <h3 className='font-semibold text-primary/80 uppercase tracking-wider text-sm border-b pb-2'>
                  Chi tiết hàng nhập
                </h3>

                <div className='border rounded-md overflow-hidden'>
                  <table className='w-full text-sm text-left'>
                    <thead className='bg-muted/50 text-xs text-muted-foreground uppercase'>
                      <tr>
                        <th className='px-4 py-3 font-medium'>#</th>
                        <th className='px-4 py-3 font-medium'>{t('fields.sku')}</th>
                        <th className='px-4 py-3 font-medium'>{t('fields.product')}</th>
                        <th className='px-4 py-3 font-medium text-right'>{t('fields.quantity')}</th>
                        <th className='px-4 py-3 font-medium text-right'>
                          {t('fields.importPrice')}
                        </th>
                        <th className='px-4 py-3 font-medium text-right'>
                          {t('fields.totalPrice')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y'>
                      {receipt.details && receipt.details.length > 0 ? (
                        receipt.details.map((detail, index) => (
                          <tr key={detail.id} className='hover:bg-muted/10 transition-colors'>
                            <td className='px-4 py-3 text-muted-foreground'>{index + 1}</td>
                            <td className='px-4 py-3 font-medium'>
                              <span className='bg-muted px-2 py-1 rounded text-xs'>
                                {detail.sku}
                              </span>
                            </td>
                            <td className='px-4 py-3'>
                              <div className='flex flex-col gap-0.5'>
                                <span className='font-semibold text-primary'>
                                  {detail.productName}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  {detail.versionName} • {detail.colorName}
                                </span>
                              </div>
                            </td>
                            <td className='px-4 py-3 text-right font-semibold text-base'>
                              {detail.quantity}
                            </td>
                            <td className='px-4 py-3 text-right text-muted-foreground'>
                              {formatVND(detail.importPrice)}
                            </td>
                            <td className='px-4 py-3 text-right font-medium text-destructive'>
                              {formatVND(detail.totalPrice)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className='px-4 py-12 text-center text-muted-foreground'>
                            Không có dữ liệu chi tiết
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className='bg-muted/30 border-t-2'>
                      <tr>
                        <td
                          colSpan={5}
                          className='px-4 py-4 text-right font-semibold uppercase text-muted-foreground text-xs'
                        >
                          Tổng cộng hóa đơn:
                        </td>
                        <td className='px-4 py-4 text-right font-bold text-destructive text-lg'>
                          {formatVND(receipt.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className='px-6 py-4 border-t bg-muted/20 sm:justify-between items-center flex-row'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Đóng
            </Button>

            {/* CỤM NÚT THAO TÁC - Chỉ hiện khi phiếu đang PENDING */}
            {receipt.status === ReceiptStatus.PENDING && (
              <div className='flex items-center gap-2'>
                <Button
                  variant='destructive'
                  onClick={() => setOpenConfirmCancel(true)}
                  disabled={approveMutation.isPending || cancelMutation.isPending}
                >
                  <XCircle className='mr-2 h-4 w-4' />
                  {t('actions.cancel', 'Hủy phiếu')}
                </Button>

                <Button
                  className='bg-green-600 hover:bg-green-700 text-white'
                  onClick={() => setOpenConfirmApprove(true)}
                  disabled={approveMutation.isPending || cancelMutation.isPending}
                >
                  <CheckCircle className='mr-2 h-4 w-4' />
                  {t('actions.complete')}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG XÁC NHẬN DUYỆT PHIẾU */}
      <AlertDialog open={openConfirmApprove} onOpenChange={setOpenConfirmApprove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.complete')}</AlertDialogTitle>
            <AlertDialogDescription className='space-y-2 pt-2'>
              <p>{t('message.confirm.complete')}</p>
              <p className='p-3 bg-muted rounded-md text-sm'>
                Xác nhận cộng kho cho phiếu:{' '}
                <strong className='text-primary'>{receipt.receiptCode}</strong>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={approveMutation.isPending}>
              {i18n.t('common:common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className='bg-green-600 hover:bg-green-700 text-white'
                onClick={handleConfirmApprove}
                disabled={approveMutation.isPending}
              >
                <CheckCircle className='mr-2 h-4 w-4' />
                Xác nhận Duyệt
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DIALOG XÁC NHẬN HỦY PHIẾU */}
      <AlertDialog open={openConfirmCancel} onOpenChange={setOpenConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-destructive'>Hủy phiếu nhập kho</AlertDialogTitle>
            <AlertDialogDescription className='space-y-2 pt-2'>
              <p>
                {t(
                  'message.confirm.cancel',
                  'Bạn có chắc chắn muốn hủy phiếu nhập này? Trạng thái sẽ chuyển sang Đã hủy và không thể hoàn tác.'
                )}
              </p>
              <p className='p-3 bg-red-50/50 dark:bg-red-950/20 rounded-md text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900'>
                Hủy phiếu: <strong>{receipt.receiptCode}</strong>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              {i18n.t('common:common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant='destructive'
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isPending}
              >
                <XCircle className='mr-2 h-4 w-4' />
                Xác nhận Hủy
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
