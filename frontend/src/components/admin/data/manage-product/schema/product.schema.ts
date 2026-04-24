import { z } from 'zod'
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/defines/upload-image'
import i18n from '@/i18n/i18n'
import { ProductStatus } from '@/defines/enum/product.enum'

const dynamicSpecSchema = z
  .array(
    z.object({
      label: z.string().min(1, 'Tên thông số không được trống'),
      value: z.string().min(1, 'Giá trị không được trống')
    })
  )
  .optional()

export const createProductSchema = z.object({
  productName: z.string().min(1, i18n.t('product:schema.productName.required')),
  slug: z.string().min(1, i18n.t('product:schema.slug.required')),
  productDesc: z.string().optional(),
  warrantyMonths: z.number().min(0, i18n.t('product:schema.warrantyMonths.min')).optional(),
  categoryId: z
    .string({ message: i18n.t('product:schema.categoryId.required') })
    .min(1, i18n.t('product:schema.categoryId.required')),
  brandId: z
    .string({ message: i18n.t('product:schema.brandId.required') })
    .min(1, i18n.t('product:schema.brandId.required')),
  tagIds: z.array(z.string()).optional(),

  thumbnail: z
    .any()
    .refine((file) => !file || file instanceof File, i18n.t('product:schema.thumbnail.invalid'))
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      i18n.t('product:schema.thumbnail.invalidType')
    )
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      i18n.t('product:schema.thumbnail.maxSize')
    )
    .optional()
    .nullable(),

  images: z
    .array(z.any())
    .refine(
      (files) => files.every((file) => file instanceof File),
      i18n.t('product:schema.images.invalid')
    )
    .refine(
      (files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      i18n.t('product:schema.images.invalidType')
    )
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      i18n.t('product:schema.images.maxSize')
    )
    .optional(),

  specs: dynamicSpecSchema
})

export const updateProductSchema = z.object({
  productName: z.string().min(1, i18n.t('product:schema.productName.required')),
  slug: z.string().min(1, i18n.t('product:schema.slug.required')),
  productDesc: z.string().optional(),
  warrantyMonths: z.number().min(0, i18n.t('product:schema.warrantyMonths.min')).optional(),
  categoryId: z.string().min(1, i18n.t('product:schema.categoryId.required')),
  brandId: z.string().min(1, i18n.t('product:schema.brandId.required')),
  tagIds: z.array(z.string()).optional(),
  status: z.enum([
    ProductStatus.ACTIVE,
    ProductStatus.INACTIVE,
    ProductStatus.OUT_OF_STOCK,
    ProductStatus.DISCONTINUED
  ]),
  thumbnail: z
    .any()
    .refine(
      (file) => !file || typeof file === 'string' || file instanceof File,
      i18n.t('product:schema.thumbnail.invalid')
    )
    .refine(
      (file) => !file || typeof file === 'string' || ACCEPTED_IMAGE_TYPES.includes(file.type),
      i18n.t('product:schema.thumbnail.invalidType')
    )
    .refine(
      (file) => !file || typeof file === 'string' || file.size <= MAX_FILE_SIZE,
      i18n.t('product:schema.thumbnail.maxSize')
    )
    .optional()
    .nullable(),

  images: z
    .array(z.any())
    .refine(
      (files) => files.every((file) => typeof file === 'string' || file instanceof File),
      i18n.t('product:schema.images.invalid')
    )
    .refine(
      (files) =>
        files.every((file) => typeof file === 'string' || ACCEPTED_IMAGE_TYPES.includes(file.type)),
      i18n.t('product:schema.images.invalidType')
    )
    .refine(
      (files) => files.every((file) => typeof file === 'string' || file.size <= MAX_FILE_SIZE),
      i18n.t('product:schema.images.maxSize')
    )
    .optional(),

  specs: dynamicSpecSchema // Thay thế cấu trúc cũ
})

export type CreateProductFormValues = z.infer<typeof createProductSchema>
export type UpdateProductFormValues = z.infer<typeof updateProductSchema>
