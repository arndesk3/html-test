import 'server-only'
import { cache } from 'react'
import { db } from './db'
import { getSession } from './session'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
})

export const getUsers = cache(async () => {
  const session = await verifySession()
  const { rows } = await db.query('SELECT id, first_name, last_name, role FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = $1)', [session.userId])
  return rows
})
