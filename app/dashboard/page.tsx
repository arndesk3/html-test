import { UserList } from '../ui/user-list';

export default async function DashboardPage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Manage Users</h1>
      <UserList />
    </main>
  );
}
