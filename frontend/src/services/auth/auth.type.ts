export interface AuthResponse {
  accessToken: string
  tokenType: string
}

// Payload mà chúng ta giải mã được từ JWT
export interface JwtPayload {
  sub: string // email
  roles: string[]
  username?: string // Thêm trường này
  avatar?: string // Thêm trường này
  iat: number
  exp: number
}
