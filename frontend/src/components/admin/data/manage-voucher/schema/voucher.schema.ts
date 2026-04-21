import { VoucherStatus, VoucherType } from '@/defines/enum/voucher.enum'
import i18n from '@/i18n/i18n'
import { z } from 'zod'

export const createVoucherSchema = z
  .object({
    voucherCode: z
      .string()
      .min(1, i18n.t('voucher:schema.voucherCode.required'))
      .trim()
      .toUpperCase(),
    voucherName: z.string().min(1, i18n.t('voucher:schema.voucherName.required')),
    type: z.nativeEnum(VoucherType),
    status: z.nativeEnum(VoucherStatus),

    discountValue: z
      .number({ message: i18n.t('voucher:schema.discountValue.invalid') })
      .min(0, i18n.t('voucher:schema.discountValue.min')),

    minOrderValue: z
      .number({ message: i18n.t('voucher:schema.minOrderValue.invalid') })
      .min(0, i18n.t('voucher:schema.minOrderValue.min')),

    maxDiscountAmount: z
      .number({ message: i18n.t('voucher:schema.maxDiscountAmount.invalid') })
      .min(0, i18n.t('voucher:schema.maxDiscountAmount.min'))
      .nullable()
      .optional(),

    usageLimit: z
      .number({ message: i18n.t('voucher:schema.usageLimit.invalid') })
      .min(1, i18n.t('voucher:schema.usageLimit.invalid'))
      .nullable()
      .optional(),

    // ĐÃ SỬA: Bắt buộc nhập ngày tháng
    startDate: z.string().min(1, i18n.t('voucher:schema.dates.startRequired')),
    endDate: z.string().min(1, i18n.t('voucher:schema.dates.endRequired'))
  })
  .refine(
    (data) => {
      // Chỉ check logic ngày khi cả 2 trường đều đã được nhập
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate)
      }
      return true
    },
    {
      message: i18n.t('voucher:schema.dates.invalidRange'),
      path: ['endDate'] // Gắn lỗi vào field endDate
    }
  )

export const editVoucherSchema = createVoucherSchema

export type CreateVoucherFormValues = z.infer<typeof createVoucherSchema>
export type EditVoucherFormValues = z.infer<typeof editVoucherSchema>
