import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'
import { SessionPayload } from './definitions'

const secretKey = process.env.SESSION_SECRET as string
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, { algorithms: ['HS256'] })
    return payload as SessionPayload
  } catch (e) {
    return null
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const { rows } = await db.query(
    'INSERT INTO sessions (user_id, expires_at) VALUES ($1,$2) RETURNING id',
    [userId, expiresAt]
  )
  const sessionId = rows[0].id as string
  const token = await encrypt({ sessionId, expiresAt })
  const cookieStore = cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession(sessionId: string) {
  await db.query('DELETE FROM sessions WHERE id = $1', [sessionId])
  cookies().delete('session')
}

export async function getSession() {
  const token = cookies().get('session')?.value
  if (!token) return null
  const payload = await decrypt(token)
  if (!payload) return null
  const { rows } = await db.query('SELECT id, user_id FROM sessions WHERE id = $1', [payload.sessionId])
  const session = rows[0]
  if (!session) return null
  return { id: session.id as string, userId: session.user_id as string }
}
