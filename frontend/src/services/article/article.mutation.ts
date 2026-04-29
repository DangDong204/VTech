import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { CreateArticlePayload } from './article.type'
import { createArticleApi, updateArticleApi } from './article.api'

export const useCreateArticle = (onSuccess?: () => void) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation('article')

  return useMutation({
    mutationFn: (payload: CreateArticlePayload) => createArticleApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      toast.success(t('message.success.created'))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t('message.error.create'))
    }
  })
}

export const useUpdateArticle = (id: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation('article')

  return useMutation({
    mutationFn: (payload: CreateArticlePayload) => updateArticleApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      toast.success(t('message.success.updated'))
      onSuccess?.()
    },
    onError: () => {
      toast.error(t('message.error.update'))
    }
  })
}
