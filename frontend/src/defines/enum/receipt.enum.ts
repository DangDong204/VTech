export const SupplierStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const

export const ReceiptStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

export type SupplierStatus = (typeof SupplierStatus)[keyof typeof SupplierStatus]
export type ReceiptStatus = (typeof ReceiptStatus)[keyof typeof ReceiptStatus]
