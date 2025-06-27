import { getUsers } from '../actions/auth'

export async function UserList() {
  const users = await getUsers()

  return (
    <div className="space-y-2">
      {users.map(u => (
        <div key={u.id} className="border p-2 rounded">
          <p>{u.first_name} {u.last_name} - {u.role}</p>
        </div>
      ))}
    </div>
  )
}
