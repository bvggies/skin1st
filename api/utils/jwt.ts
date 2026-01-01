import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const ACCESS_EXPIRES = '15m'
const REFRESH_EXPIRES = '30d'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret'

export function signAccessToken(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET)
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES })
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET)
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}