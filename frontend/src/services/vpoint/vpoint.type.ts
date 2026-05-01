export type MemberTier = 'MEMBER' | 'SILVER' | 'GOLD' | 'DIAMOND'

export type VpointTransactionType =
  | 'EARN_ORDER'
  | 'EARN_REVIEW_TEXT'
  | 'EARN_REVIEW_MEDIA'
  | 'EARN_BIRTHDAY'
  | 'EARN_ADMIN_GIFT'
  | 'SPEND_ORDER'
  | 'REFUND_ORDER'
  | 'DEDUCT_RETURN'

export interface VpointHistoryResponse {
  id: string
  amount: number
  transactionType: VpointTransactionType
  referenceId?: string
  description: string
  createdAt: string
}
