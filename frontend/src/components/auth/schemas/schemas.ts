import {
  PASSWORD_LOWERCASE_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_SPECIAL_REGEX,
  PASSWORD_UPPERCASE_REGEX,
  USERNAME_MIN_LENGTH
} from '@/defines/auth-constants'
import i18n from '@/i18n/i18n'
import { z } from 'zod'

export const logInSchema = z.object({
  email: z
    .string()
    .min(1, i18n.t('auth:errors.email.required'))
    .email(i18n.t('auth:errors.email.invalid')),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, i18n.t('auth:errors.password.min'))
    .refine((val) => PASSWORD_UPPERCASE_REGEX.test(val), {
      message: i18n.t('auth:errors.password.uppercase')
    })
    .refine((val) => PASSWORD_LOWERCASE_REGEX.test(val), {
      message: i18n.t('auth:errors.password.lowercase')
    })
    .refine((val) => PASSWORD_NUMBER_REGEX.test(val), {
      message: i18n.t('auth:errors.password.number')
    })
    .refine((val) => PASSWORD_SPECIAL_REGEX.test(val), {
      message: i18n.t('auth:errors.password.special')
    })
})

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(1, i18n.t('auth:errors.fullName.required'))
    .min(3, i18n.t('auth:errors.fullName.min')),
  phone: z
    .string()
    .min(1, i18n.t('auth:errors.phone.required'))
    .min(8, i18n.t('auth:errors.phone.min')),
  dob: z.string().min(1, i18n.t('auth:errors.dob.required')),
  gender: z.string().min(1, i18n.t('auth:errors.gender.required')),

  username: z
    .string()
    .min(1, i18n.t('auth:errors.username.min')) // Nếu rỗng báo lỗi
    .min(USERNAME_MIN_LENGTH, i18n.t('auth:errors.username.min')),
  email: z
    .string()
    .min(1, i18n.t('auth:errors.email.required'))
    .email(i18n.t('auth:errors.email.invalid')),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, i18n.t('auth:errors.password.min'))
    .refine((val) => PASSWORD_UPPERCASE_REGEX.test(val), {
      message: i18n.t('auth:errors.password.uppercase')
    })
    .refine((val) => PASSWORD_LOWERCASE_REGEX.test(val), {
      message: i18n.t('auth:errors.password.lowercase')
    })
    .refine((val) => PASSWORD_NUMBER_REGEX.test(val), {
      message: i18n.t('auth:errors.password.number')
    })
    .refine((val) => PASSWORD_SPECIAL_REGEX.test(val), {
      message: i18n.t('auth:errors.password.special')
    })
})

export const forgotPasswordStep1Schema = z.object({
  email: z
    .string()
    .min(1, i18n.t('auth:errors.email.required'))
    .email(i18n.t('auth:errors.email.invalid'))
})

export const forgotPasswordStep3Schema = z
  .object({
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, i18n.t('auth:errors.password.min'))
      .refine((val) => PASSWORD_UPPERCASE_REGEX.test(val), {
        message: i18n.t('auth:errors.password.uppercase')
      })
      .refine((val) => PASSWORD_LOWERCASE_REGEX.test(val), {
        message: i18n.t('auth:errors.password.lowercase')
      })
      .refine((val) => PASSWORD_NUMBER_REGEX.test(val), {
        message: i18n.t('auth:errors.password.number')
      })
      .refine((val) => PASSWORD_SPECIAL_REGEX.test(val), {
        message: i18n.t('auth:errors.password.special')
      }),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export const updateProfileSchema = z.object({
  username: z.string().min(USERNAME_MIN_LENGTH, i18n.t('auth:errors.username.min')),
  fullName: z.string().min(3, i18n.t('auth:errors.fullName.min')),
  phone: z.string().min(8, i18n.t('auth:errors.phone.min')),
  gender: z.string().min(1, i18n.t('auth:errors.gender.required'))
})
