import { ProductStatus } from '@/defines/enum/product.enum'
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/defines/upload-image'
import i18n from '@/i18n/i18n'
import { z } from 'zod'

export const variantSchema = z
  .object({
    colorId: z.string().min(1, i18n.t('variant:schema.colorId.required')),
    versionId: z.string().min(1, i18n.t('variant:schema.versionId.required')),
    sku: z.string().min(1, i18n.t('variant:schema.sku.required')),
    basePrice: z.number({ message: i18n.t('variant:schema.basePrice.invalid') }).min(0),

    salePrice: z.number().min(0).optional().nullable(),

    stockQuantity: z.number().int().min(0),
    status: z.enum([
      ProductStatus.ACTIVE,
      ProductStatus.INACTIVE,
      ProductStatus.OUT_OF_STOCK,
      ProductStatus.DISCONTINUED
    ]),
    image: z
      .any()
      .refine(
        (file) => !file || typeof file === 'string' || file instanceof File,
        i18n.t('variant:schema.image.invalid')
      )
      .refine(
        (file) => !file || typeof file === 'string' || ACCEPTED_IMAGE_TYPES.includes(file.type),
        i18n.t('variant:schema.image.invalidType')
      )
      .refine(
        (file) => !file || typeof file === 'string' || file.size <= MAX_FILE_SIZE,
        i18n.t('variant:schema.image.maxSize')
      )
      .optional()
      .nullable()
  })
  .refine(
    (data) => {
      if (data.salePrice && data.salePrice > data.basePrice) {
        return false
      }
      return true
    },
    {
      message: i18n.t('variant:schema.salePrice.max'),
      path: ['salePrice']
    }
  )

export type VariantFormValues = z.infer<typeof variantSchema>
