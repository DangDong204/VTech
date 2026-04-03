import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/defines/error.type'
import type { ApiResponse } from '@/defines/apiResponse'

export function useAppMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  keys: string | QueryKey | (string | QueryKey)[],
  successMessage: string,
  errorMessage?: string,
  onSuccessCallback?: () => void
) {
  const queryClient = useQueryClient()

  const normalizeKey = (key: string | QueryKey) => (Array.isArray(key) ? key : [key])

  const queryKeys = Array.isArray(keys) ? keys : [keys]

  return useMutation<ApiResponse<TData>, AxiosError<ApiErrorResponse>, TVariables>({
    mutationFn,
    onSuccess: (response) => {
      const message = response.message ?? successMessage
      toast.success(message)

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
