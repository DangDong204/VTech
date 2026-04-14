import type { TagStatus } from '@/defines/enum/tag.enum'

export interface TagResponse {
  id: string
  tagName: string
  tagDesc?: string
  status: TagStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateTagPayload {
  tagName: string
  tagDesc?: string
}

export interface UpdateTagPayload {
  tagName: string
  tagDesc?: string
  status: TagStatus
}
