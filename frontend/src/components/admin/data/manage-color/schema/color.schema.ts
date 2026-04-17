import i18n from '@/i18n/i18n'
import { z } from 'zod'

export const colorSchema = z.object({
  colorName: z.string().min(1, i18n.t('color:schema.colorName.required')),
  hexCode: z
    .string()
    .min(1, i18n.t('color:schema.hexCode.required'))
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: i18n.t('color:schema.hexCode.invalid')
    })
})

export type ColorFormValues = z.infer<typeof colorSchema>
