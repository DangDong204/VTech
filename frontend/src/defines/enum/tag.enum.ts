export const TagStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const

export type TagStatus = (typeof TagStatus)[keyof typeof TagStatus]
