import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Welcome</h1>
      <div className="space-x-4">
        <Link href="/signup">Sign Up</Link>
        <Link href="/login">Login</Link>
      </div>
    </main>
  );
}
