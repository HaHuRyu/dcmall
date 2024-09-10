import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { password_check } from '../../../_lib/salt';
import { queryDatabase, updateSessionInDB } from '../../../_lib/db';
import { cookies } from 'next/headers';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const query = await queryDatabase(credentials.email);
        if (query) {
          const user = query[0];
          const isValidPassword = password_check(user.password, credentials.password);
          if (isValidPassword) {
            return {
              id: user.id,
              email: credentials.email,
              name: user.name
            };
          }
        }
        return null;
      }
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.provider = token.provider;
      session.user.email = token.email || session.user.email;
      session.user.name = token.name || session.user.name;
      
      // 세션 토큰을 쿠키에서 가져와 데이터베이스에 저장
      const cookieStore = cookies();
      const sessionToken = cookieStore.get('next-auth.session-token');
      if (sessionToken) {
        await updateSessionInDB(session.user.email, sessionToken.value);
      }
      
      return session;
    },
  },

  events: {
    async signIn({ user, account }) {
      // 로그인 시 추가 작업이 필요하다면 여기에 구현
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
});

export { handler as GET, handler as POST };