import ClientComponent from './api/components/ClientComponent';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('next-session');

  return <ClientComponent sessionCookie={sessionCookie ? sessionCookie.value : null} />;
}