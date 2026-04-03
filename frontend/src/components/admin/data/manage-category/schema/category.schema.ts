import { CategoryStatus } from '@/defines/enum/category.enum'
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/defines/upload-image'
import i18n from '@/i18n/i18n'
import { z } from 'zod'

export const createCategorySchema = z.object({
  categoryName: z.string().min(1, i18n.t('category:schema.categoryName.required')),
  slug: z.string().min(1, i18n.t('category:schema.slug.required')),
  categoryDesc: z.string().optional(),
  parentId: z.string().optional().nullable(),
  displayOrder: z
    .number()
    .int(i18n.t('category:schema.displayOrder.invalid'))
    .min(0, i18n.t('category:schema.displayOrder.min')),
  thumbnail: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      i18n.t('category:schema.thumbnail.invalidType')
    )
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      i18n.t('category:schema.thumbnail.maxSize')
    )
})

export const editCategorySchema = z.object({
  categoryName: z.string().min(1, i18n.t('category:schema.categoryName.required')),
  slug: z.string().min(1, i18n.t('category:schema.slug.required')),
  categoryDesc: z.string().optional(),
  parentId: z.string().optional().nullable(),
  displayOrder: z
    .number()
    .int(i18n.t('category:schema.displayOrder.invalid'))
    .min(0, i18n.t('category:schema.displayOrder.min')),
  status: z.nativeEnum(CategoryStatus),
  thumbnail: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      i18n.t('category:schema.thumbnail.invalidType')
    )
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      i18n.t('category:schema.thumbnail.maxSize')
    )
})

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>
export type EditCategoryFormValues = z.infer<typeof editCategorySchema>
