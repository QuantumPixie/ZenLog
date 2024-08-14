import type { Request } from 'express'

export interface User {
  id: number
  email?: string
  username?: string
}

export interface CustomRequest extends Request {
  user?: User
}
