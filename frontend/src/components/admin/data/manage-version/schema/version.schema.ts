import i18n from '@/i18n/i18n'
import { z } from 'zod'

export const versionSchema = z.object({
  versionName: z.string().min(1, i18n.t('version:schema.versionName.required'))
})

export type VersionFormValues = z.infer<typeof versionSchema>
