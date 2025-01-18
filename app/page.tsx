import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  }

  // Optional: Verify token validity with Firebase Admin SDK if needed
  // If invalid, redirect to login
  return redirect('/dashboard');
}
