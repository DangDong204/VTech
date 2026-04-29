import type { ArticleStatus } from '@/defines/enum/article.enum'

export interface ArticleProductDto {
  id: string
  productName: string
  slug: string
}

export interface ArticleResponse {
  id: string
  title: string
  slug: string
  summary?: string | null
  content: string
  thumbnail?: string | null
  authorName: string
  viewCount: number
  status: ArticleStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  products?: ArticleProductDto[]
}

export interface CreateArticlePayload {
  title: string
  summary?: string
  content: string
  status: ArticleStatus
  thumbnail?: File | string | null
  productIds?: string[]
}

export type UpdateArticlePayload = CreateArticlePayload
