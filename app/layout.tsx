import { Inter } from "next/font/google";
import "./globals.css";
import Header from './components/Header';
import { cookies } from 'next/headers';
import GoogleOAuthWrapper from './components/GoogleOAuthWrapper/GoogleOAuthWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dcmall",
  description: "Dcmall shopping platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('next-session');

  return (
    <html lang="ko">
      <body className={inter.className}>
        <GoogleOAuthWrapper>
          <div className="container">
            <Header sessionCookie={sessionCookie ? sessionCookie.value : null} />
            <main>{children}</main>
          </div>
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}