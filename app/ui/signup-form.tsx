'use client'
import { useActionState } from 'react'
import { signup } from '../actions/auth'

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="firstName">First Name</label>
        <input id="firstName" name="firstName" className="border" />
      </div>
      <div>
        <label htmlFor="lastName">Last Name</label>
        <input id="lastName" name="lastName" className="border" />
      </div>
      <div>
        <label htmlFor="company">Company</label>
        <input id="company" name="company" className="border" />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="border" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="border" />
      </div>
      {state?.message && <p className="text-red-500">{state.message}</p>}
      <button type="submit" disabled={pending}>Sign Up</button>
    </form>
  )
}
