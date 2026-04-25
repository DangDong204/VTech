export interface AddressResponse {
  id: string
  recipientName: string
  phone: string
  provinceId: string
  provinceName: string
  districtId: string
  districtName: string
  wardId: string
  wardName: string
  specificAddress: string
  addressType: 'HOME' | 'OFFICE'
  isDefault: boolean
}

export interface AddressRequest {
  recipientName: string
  phone: string
  provinceId: string
  provinceName: string
  districtId: string
  districtName: string
  wardId: string
  wardName: string
  specificAddress: string
  addressType: 'HOME' | 'OFFICE'
  isDefault: boolean
}
