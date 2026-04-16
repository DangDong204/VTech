import type { ApiResponse } from '@/defines/apiResponse'
import type {
  CreateProductPayload,
  ProductImageResponse,
  ProductResponse,
  SpecificationPayload,
  SpecificationResponse,
  UpdateProductPayload,
  UploadProductImagesPayload
} from '@/services/product/product.type'
import { api } from '@/utils/axiosCustomize'

export const getAllProductsApi = async () => {
  const res = await api.get<ApiResponse<ProductResponse[]>>('/products')
  return res.data.data
}

export const getProductByIdApi = async (productId: string) => {
  const res = await api.get<ApiResponse<ProductResponse>>(`/products/${productId}`)
  return res.data.data
}

// --- THÊM & SỬA SẢN PHẨM ---

export const createProductApi = async (payload: CreateProductPayload) => {
  const formData = new FormData()

  formData.append('productName', payload.productName)
  formData.append('slug', payload.slug)
  formData.append('categoryId', payload.categoryId)
  formData.append('brandId', payload.brandId)

  if (payload.productDesc) formData.append('productDesc', payload.productDesc)
  if (payload.warrantyMonths !== undefined)
    formData.append('warrantyMonths', String(payload.warrantyMonths))

  // Xử lý mảng tagIds (Spring Boot @ModelAttribute sẽ nhận các giá trị trùng key là mảng)
  if (payload.tagIds && payload.tagIds.length > 0) {
    payload.tagIds.forEach((tagId) => formData.append('tagIds', tagId))
  }

  const res = await api.post<ApiResponse<ProductResponse>>('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const updateProductApi = async (productId: string, payload: UpdateProductPayload) => {
  const formData = new FormData()

  formData.append('productName', payload.productName)
  formData.append('slug', payload.slug)

  if (payload.categoryId) formData.append('categoryId', payload.categoryId)
  if (payload.brandId) formData.append('brandId', payload.brandId)
  if (payload.productDesc) formData.append('productDesc', payload.productDesc)
  if (payload.warrantyMonths !== undefined)
    formData.append('warrantyMonths', String(payload.warrantyMonths))
  if (payload.status !== undefined) formData.append('status', String(payload.status))

  if (payload.tagIds && payload.tagIds.length > 0) {
    payload.tagIds.forEach((tagId) => formData.append('tagIds', tagId))
  }

  const res = await api.put<ApiResponse<ProductResponse>>(`/products/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// --- XỬ LÝ ẢNH SẢN PHẨM (Tách biệt theo logic Backend) ---

export const uploadProductImagesApi = async (payload: UploadProductImagesPayload) => {
  const formData = new FormData()

  if (payload.thumbnail) {
    formData.append('thumbnail', payload.thumbnail)
  }

  if (payload.images && payload.images.length > 0) {
    payload.images.forEach((image) => formData.append('images', image))
  }

  const res = await api.post<ApiResponse<void>>(`/products/${payload.productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const getProductImagesApi = async (productId: string) => {
  const res = await api.get<ApiResponse<ProductImageResponse>>(`/products/${productId}/images`)
  return res.data.data
}

export const deleteProductImageApi = async (productId: string, imageUrl: string) => {
  // Gửi URL ảnh cần xóa lên Backend qua Query Parameter
  const res = await api.delete<ApiResponse<void>>(`/products/${productId}/images/detail`, {
    params: { imageUrl }
  })
  return res.data
}

// --- XÓA & KHÔI PHỤC ---

export const deleteSoftProductApi = async (productId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/products/${productId}`)
  return res.data
}

export const getAllProductInTrashApi = async () => {
  const res = await api.get<ApiResponse<ProductResponse[]>>('/products/trash')
  return res.data.data
}

export const restoreProductApi = async (productId: string) => {
  const res = await api.patch<ApiResponse<void>>(`/products/trash/${productId}`)
  return res.data
}

export const deleteHardProductApi = async (productId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/products/trash/${productId}`)
  return res.data
}

// --- BỘ LỌC TÌM KIẾM ---

export const getProductsByTagApi = async (tagId: string) => {
  const res = await api.get<ApiResponse<ProductResponse[]>>(`/products/tags/${tagId}`)
  return res.data.data
}

export const getProductsByCategoryApi = async (categoryId: string) => {
  const res = await api.get<ApiResponse<ProductResponse[]>>(`/products/categories/${categoryId}`)
  return res.data.data
}

export const getProductsByBrandApi = async (brandId: string) => {
  const res = await api.get<ApiResponse<ProductResponse[]>>(`/products/brands/${brandId}`)
  return res.data.data
}

// --- SPECIFICCATION ----
export const createProductSpecificationApi = async (
  productId: string,
  payload: SpecificationPayload
) => {
  const res = await api.post<ApiResponse<SpecificationResponse>>(
    `/products/${productId}/specification`,
    payload
  )
  return res.data
}

export const getProductSpecificationApi = async (productId: string) => {
  const res = await api.get<ApiResponse<SpecificationResponse>>(
    `/products/${productId}/specification`
  )
  return res.data.data
}

export const updateProductSpecificationApi = async (
  productId: string,
  payload: SpecificationPayload
) => {
  const res = await api.put<ApiResponse<SpecificationResponse>>(
    `/products/${productId}/specification`,
    payload
  )
  return res.data
}
