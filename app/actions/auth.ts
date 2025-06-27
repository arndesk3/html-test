'use server'
import { SignupSchema, LoginSchema, FormState } from '../lib/definitions'
import { db } from '../lib/db'
import { createSession, deleteSession, getSession } from '../lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcrypt'

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignupSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { message: 'Invalid input' }
  }
  const { firstName, lastName, company, email, password } = parsed.data
  const hash = await bcrypt.hash(password, 10)
  const { rows } = await db.query(
    `WITH c AS (
      INSERT INTO companies (name) VALUES ($1)
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    )
    INSERT INTO users (first_name, last_name, company_id, email, password, role)
    VALUES ($2, $3, (SELECT id FROM c), $4, $5, 'owner')
    RETURNING id`,
    [company, firstName, lastName, email, hash]
  )
  const user = rows[0]
  if (!user) return { message: 'Signup failed' }
  await createSession(user.id)
  redirect('/dashboard')
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { message: 'Invalid input' }
  }
  const { email, password } = parsed.data
  const { rows } = await db.query('SELECT id, password FROM users WHERE email=$1', [email])
  const user = rows[0]
  if (!user) return { message: 'Invalid credentials' }
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { message: 'Invalid credentials' }
  await createSession(user.id)
  redirect('/dashboard')
}

export async function logout() {
  const session = await getSession()
  if (session) {
    await deleteSession(session.id)
  }
  redirect('/login')
}

export async function createUser(state: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession()
  if (!session) return { message: 'Unauthorized' }
  const { rows: ownerRows } = await db.query('SELECT role, company_id FROM users WHERE id=$1', [session.userId])
  const owner = ownerRows[0]
  if (!owner || owner.role !== 'owner') return { message: 'Forbidden' }
  const parsed = SignupSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { message: 'Invalid input' }
  const { firstName, lastName, company, email, password } = parsed.data
  const hash = await bcrypt.hash(password, 10)
  const { rows } = await db.query(
    'INSERT INTO users (first_name, last_name, company_id, email, password, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
    [firstName, lastName, owner.company_id, email, hash, formData.get('role') || 'member']
  )
  const user = rows[0]
  if (!user) return { message: 'Failed to create user' }
  return { message: 'User created' }
}

export async function getUsers() {
  const session = await getSession()
  if (!session) return []
  const { rows } = await db.query('SELECT id, first_name, last_name, role FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = $1)', [session.userId])
  return rows
}
