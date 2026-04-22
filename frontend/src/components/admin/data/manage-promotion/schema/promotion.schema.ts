import { PromotionStatus, PromotionType } from '@/defines/enum/promotion.enum'
import i18n from '@/i18n/i18n'
import { z } from 'zod'

export const createPromotionSchema = z
  .object({
    promotionName: z.string().min(1, i18n.t('promotion:schema.promotionName.required')).trim(),
    promotionDesc: z.string().optional().nullable(),
    discountType: z.nativeEnum(PromotionType),
    status: z.nativeEnum(PromotionStatus),

    discountValue: z
      .number({ message: i18n.t('promotion:schema.discountValue.invalid') })
      .min(0, i18n.t('promotion:schema.discountValue.min')),

    startDate: z.string().min(1, i18n.t('promotion:schema.dates.startRequired')),
    endDate: z.string().min(1, i18n.t('promotion:schema.dates.endRequired')),

    // Mảng chứa các chuỗi ID của Product Variant
    variantIds: z.array(z.string()).optional().nullable()
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate)
      }
      return true
    },
    {
      message: i18n.t('promotion:schema.dates.invalidRange'),
      path: ['endDate']
    }
  )

export type CreatePromotionFormValues = z.infer<typeof createPromotionSchema>

export const editPromotionSchema = createPromotionSchema
export type EditPromotionFormValues = z.infer<typeof editPromotionSchema>
