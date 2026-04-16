import { TagStatus } from '@/defines/enum/tag.enum'
import i18n from '@/i18n/i18n'
import { z } from 'zod'

export const createTagSchema = z.object({
  tagName: z
    .string()
    .min(1, i18n.t('tag:schema.tagName.required'))
    .max(50, i18n.t('tag:schema.tagName.max')),

  tagDesc: z.string().max(255, i18n.t('tag:schema.tagDesc.max')).optional()
})

export const editTagSchema = z.object({
  tagName: z
    .string()
    .min(1, i18n.t('tag:schema.tagName.required'))
    .max(50, i18n.t('tag:schema.tagName.max')),

  tagDesc: z.string().max(255, i18n.t('tag:schema.tagDesc.max')).optional(),
  status: z.enum([TagStatus.ACTIVE, TagStatus.INACTIVE])
})

export type CreateTagFormValues = z.infer<typeof createTagSchema>
export type EditTagFormValues = z.infer<typeof editTagSchema>
