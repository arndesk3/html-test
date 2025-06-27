'use client'
import { useActionState } from 'react'
import { login } from '../actions/auth'

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="border" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="border" />
      </div>
      {state?.message && <p className="text-red-500">{state.message}</p>}
      <button type="submit" disabled={pending}>Login</button>
    </form>
  )
}
