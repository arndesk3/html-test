import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { decrypt } from './session'
import { db } from './db'

export const verifySession = cache(async () => {
  const token = cookies().get('session')?.value
  if (!token) {
    return null
  }
  const payload = await decrypt(token)
  if (!payload) return null
  const { rows } = await db.query('SELECT user_id FROM sessions WHERE id = $1', [payload.sessionId])
  const session = rows[0]
  if (!session) return null
  return { userId: session.user_id as string }
})
