import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAppMutation } from '@/hooks/useAppMutation'
import { useFetchData } from '@/hooks/useFetchData'
import {
  createManualReceiptApi,
  getAllSuppliersApi,
  previewExcelReceiptApi
} from '@/services/receipt/receipt.api'
import type { ExcelPreviewResponse } from '@/services/receipt/receipt.type'
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export function ImportExcelReceiptDialog() {
  const { t } = useTranslation('receipt')
  const [open, setOpen] = useState(false)

  // Form states
  const [file, setFile] = useState<File | null>(null)
  const [supplierId, setSupplierId] = useState('')
  const [note, setNote] = useState('')

  // Preview states
  const [previewData, setPreviewData] = useState<ExcelPreviewResponse[] | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const { data: suppliers = [] } = useFetchData('suppliers', getAllSuppliersApi)

  const mutation = useAppMutation(
    createManualReceiptApi,
    'receipts',
    t('message.success.create'),
    t('message.error.create')
  )

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setFile(null)
      setSupplierId('')
      setNote('')
      setPreviewData(null)
    }
  }

  // Bước 1: Gửi file lên để Preview
  const handlePreview = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file Excel!')
      return
    }
    setIsPreviewing(true)
    try {
      const data = await previewExcelReceiptApi(file)
      setPreviewData(data)
    } catch {
      setPreviewData(null)
    } finally {
      setIsPreviewing(false)
    }
  }

  // Bước 2: Xác nhận Import các dòng hợp lệ
  const handleConfirmImport = () => {
    if (!supplierId) {
      toast.error('Vui lòng chọn Nhà cung cấp trước khi import!')
      return
    }

    if (!previewData) return

    // Lọc ra các dòng hợp lệ
    const validRows = previewData.filter((row) => row.isValid && row.variantId)

    if (validRows.length === 0) {
      toast.error('Không có dòng dữ liệu nào hợp lệ để import!')
      return
    }

    const payload = {
      supplierId,
      note,
      details: validRows.map((row) => ({
        variantId: row.variantId!,
        quantity: row.quantity,
        importPrice: row.importPrice
      }))
    }

    mutation.mutate(payload, {
      onSuccess: () => handleOpenChange(false)
    })
  }

  // Thống kê
  const validCount = previewData?.filter((r) => r.isValid).length || 0
  const invalidCount = previewData?.filter((r) => !r.isValid).length || 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant='secondary'
          className='bg-green-100 text-green-700 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50'
        >
          <FileSpreadsheet className='mr-2 h-4 w-4' />
          {t('titles.importExcel')}
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-5xl p-0 overflow-hidden flex flex-col max-h-[90vh]'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b bg-muted/20 flex-shrink-0'>
          <DialogTitle>{t('titles.importExcel')}</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6 py-4 space-y-6'>
          {/* KHỐI 1: CẤU HÌNH IMPORT & CHỌN FILE */}
          <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
            {/* Form chọn thông tin */}
            <div className='md:col-span-5 space-y-4 bg-muted/10 p-4 rounded-lg border'>
              <div className='space-y-2'>
                <Label>
                  {t('fields.supplier.label')} <span className='text-destructive'>*</span>
                </Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('fields.supplier.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.supplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>{t('fields.note.label')}</Label>
                <Input
                  placeholder={t('fields.note.placeholder')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {/* Khu vực chọn File */}
            <div className='md:col-span-7 flex flex-col justify-center border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors'>
              <Input
                type='file'
                accept='.xlsx, .xls'
                className='hidden'
                id='excel-upload'
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Label
                htmlFor='excel-upload'
                className='cursor-pointer flex flex-col items-center gap-2'
              >
                <div className='p-3 bg-primary/10 rounded-full text-primary'>
                  <Upload className='h-6 w-6' />
                </div>
                <span className='font-medium text-base'>
                  {file ? file.name : t('import.dragDrop')}
                </span>
                <span className='text-xs text-muted-foreground'>Chỉ hỗ trợ file .xlsx</span>
              </Label>

              {file && (
                <Button
                  className='mt-4 w-fit mx-auto'
                  onClick={handlePreview}
                  disabled={isPreviewing}
                >
                  {isPreviewing ? 'Đang phân tích...' : 'Phân tích dữ liệu'}
                </Button>
              )}
            </div>
          </div>

          {/* KHỐI 2: BẢNG PREVIEW DỮ LIỆU */}
          {previewData && (
            <div className='space-y-3 animate-in fade-in slide-in-from-bottom-4'>
              <div className='flex items-center justify-between'>
                <Label className='text-base font-semibold uppercase tracking-wider'>
                  Kết quả phân tích
                </Label>
                <div className='flex gap-3 text-sm'>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                  >
                    Hợp lệ: {validCount}
                  </Badge>
                  <Badge
                    variant='outline'
                    className='bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                  >
                    Lỗi: {invalidCount}
                  </Badge>
                </div>
              </div>

              <div className='border rounded-md overflow-hidden max-h-[350px] overflow-y-auto'>
                <table className='w-full text-sm text-left'>
                  <thead className='bg-muted/80 text-xs text-muted-foreground uppercase sticky top-0 z-10'>
                    <tr>
                      <th className='px-4 py-3 font-medium w-16 text-center'>Dòng</th>
                      <th className='px-4 py-3 font-medium w-32'>SKU</th>
                      <th className='px-4 py-3 font-medium'>Sản phẩm / Lỗi</th>
                      <th className='px-4 py-3 font-medium text-right w-24'>Số lượng</th>
                      <th className='px-4 py-3 font-medium text-right w-32'>Giá nhập</th>
                      <th className='px-4 py-3 font-medium text-center w-28'>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {previewData.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          row.isValid
                            ? 'bg-green-50/50 hover:bg-green-50 dark:bg-green-950/20 dark:hover:bg-green-950/40'
                            : 'bg-red-50/50 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/40'
                        }
                      >
                        <td className='px-4 py-3 text-center text-muted-foreground font-medium'>
                          {row.rowIndex}
                        </td>
                        <td className='px-4 py-3 font-semibold'>{row.sku || '-'}</td>
                        <td className='px-4 py-3'>
                          {row.isValid ? (
                            <span className='font-medium text-primary'>{row.productName}</span>
                          ) : (
                            <div className='flex flex-col gap-1'>
                              {row.errors.map((err, i) => (
                                <span
                                  key={i}
                                  className='text-xs text-destructive flex items-center gap-1'
                                >
                                  <AlertCircle className='w-3 h-3' /> {err}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className='px-4 py-3 text-right font-medium'>{row.quantity || '-'}</td>
                        <td className='px-4 py-3 text-right text-muted-foreground'>
                          {row.importPrice ? formatVND(row.importPrice) : '-'}
                        </td>
                        <td className='px-4 py-3 text-center'>
                          {row.isValid ? (
                            <Badge
                              variant='outline'
                              className='bg-green-100 text-green-700 border-transparent dark:bg-green-900/50 dark:text-green-400'
                            >
                              <CheckCircle2 className='w-3 h-3 mr-1' /> Hợp lệ
                            </Badge>
                          ) : (
                            <Badge
                              variant='outline'
                              className='bg-red-100 text-red-700 border-transparent dark:bg-red-900/50 dark:text-red-400'
                            >
                              <XCircle className='w-3 h-3 mr-1' /> Bỏ qua
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='px-6 py-4 border-t bg-muted/20 flex-shrink-0 sm:justify-between items-center'>
          <p className='text-sm text-muted-foreground'>
            * Chỉ những dòng <strong className='text-green-600'>Hợp lệ</strong> mới được thêm vào
            phiếu nhập.
          </p>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => handleOpenChange(false)}>
              Hủy bỏ
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={!previewData || validCount === 0 || mutation.isPending}
            >
              Xác nhận Import ({validCount} dòng)
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
