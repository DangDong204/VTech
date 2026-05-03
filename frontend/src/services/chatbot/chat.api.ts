import { api } from '@/utils/axiosCustomize'

export interface ChatResponseData {
  sessionId: string
  reply: string
}

export const sendChatMessageApi = async (
  message: string,
  sessionId: string | null = null
): Promise<ChatResponseData> => {
  const res = await api.post('/client/chat', {
    sessionId: sessionId,
    message: message
  })
  return res.data.data
}
