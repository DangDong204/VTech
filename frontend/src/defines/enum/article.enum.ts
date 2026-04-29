export const ArticleStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  HIDDEN: 'HIDDEN'
} as const

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus]
