import { z } from 'zod'
import i18n from '@/i18n/i18n'
import { UserRole, UserStatus } from '@/defines/enum/user.enum'
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/defines/upload-image'

export const createUserSchema = z.object({
  username: z.string().min(3, i18n.t('auth:errors.username.min')),
  email: z
    .string()
    .min(1, i18n.t('auth:errors.email.required'))
    .email(i18n.t('auth:errors.email.invalid')),
  fullName: z.string().min(3, i18n.t('auth:errors.fullName.min')),
  phone: z.string().min(8, i18n.t('auth:errors.phone.min')),
  password: z.string().min(6, i18n.t('auth:errors.password.min')),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus)
})

export const editUserSchema = z.object({
  username: z.string().min(3, i18n.t('auth:errors.username.min')),
  fullName: z.string().optional().nullable(),
  phone: z.string().min(8, i18n.t('auth:errors.phone.min')),
  avatar: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      i18n.t('brand:schema.thumbnail.invalidType')
    )
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      i18n.t('brand:schema.thumbnail.maxSize')
    ),
  status: z.nativeEnum(UserStatus),
  roles: z.array(z.nativeEnum(UserRole)).length(1, i18n.t('user:message.error.roleRequired'))
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>
export type EditUserFormValues = z.infer<typeof editUserSchema>
