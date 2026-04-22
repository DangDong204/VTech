import { z } from 'zod'

export const receiptDetailSchema = z.object({
  productId: z.string().min(1, 'Vui lòng chọn sản phẩm'), // Trường phụ dùng cho UI
  variantId: z.string().min(1, 'Vui lòng chọn biến thể'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
  importPrice: z.number().min(0, 'Giá nhập không được âm')
})

export const createReceiptSchema = z.object({
  supplierId: z.string().min(1, 'Vui lòng chọn nhà cung cấp'),
  note: z.string().optional(),
  details: z.array(receiptDetailSchema).min(1, 'Vui lòng thêm ít nhất 1 sản phẩm vào phiếu')
})

export type CreateReceiptFormValues = z.infer<typeof createReceiptSchema>
