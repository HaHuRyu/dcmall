import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from './components/Header';
import { cookies } from 'next/headers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('next-session');

  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <Header session={sessionCookie ? sessionCookie.value : null} />
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}