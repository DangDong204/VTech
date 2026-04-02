import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/defines/upload-image'
import i18n from '@/i18n/i18n'
import z from 'zod'

export const createBrandSchema = z.object({
  brandName: z.string().min(1, i18n.t('brand:schema.brandName.required')),
  slug: z.string().min(1, i18n.t('brand:schema.slug.required')),
  brandDesc: z.string().optional(),
  displayOrder: z
    .number()
    .int(i18n.t('brand:schema.displayOrder.invalid'))
    .min(0, i18n.t('brand:schema.displayOrder.min')),
  brandLogo: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      i18n.t('brand:schema.thumbnail.invalidType')
    )
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, i18n.t('brand:schema.thumbnail.maxSize'))
})

export const editBrandSchema = z.object({
  brandName: z.string().min(1, i18n.t('brand:schema.brandName.required')),
  slug: z.string().min(1, i18n.t('brand:schema.slug.required')),
  brandDesc: z.string().optional(),
  displayOrder: z
    .number()
    .int(i18n.t('brand:schema.displayOrder.invalid'))
    .min(0, i18n.t('brand:schema.displayOrder.min')),
  brandLogo: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      i18n.t('brand:schema.thumbnail.invalidType')
    )
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, i18n.t('brand:schema.thumbnail.maxSize'))
})

export type CreateBrandFormValues = z.infer<typeof createBrandSchema>
export type EditBrandFormValues = z.infer<typeof editBrandSchema>
