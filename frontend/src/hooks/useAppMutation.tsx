import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/defines/error.type'

export function useAppMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  keys: string | QueryKey | (string | QueryKey)[],
  successMessage: string,
  errorMessage?: string,
  onSuccessCallback?: () => void
) {
  const queryClient = useQueryClient()

  const normalizeKey = (key: string | QueryKey) => (Array.isArray(key) ? key : [key])

  const queryKeys = Array.isArray(keys) ? keys : [keys]

  return useMutation<TData, AxiosError<ApiErrorResponse>, TVariables>({
    mutationFn,
    onSuccess: () => {
      toast.success(successMessage)

      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: normalizeKey(key)
        })
      })

      onSuccessCallback?.()
    },
    onError: (error) => {
      const message = error.response?.data?.message ?? errorMessage
      toast.error(message)
    }
  })
}
