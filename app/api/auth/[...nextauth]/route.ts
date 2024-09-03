import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { password_check } from '../../../_lib/salt'; // 비밀번호 확인 함수
import { queryDatabase } from '../../../_lib/db'; // 사용자 데이터베이스 조회 함수

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
            return user;
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Setting session data with token:", token);
      session.provider = token.provider;  //내가 임의적으로 새로 추가한거라 없다고 밑줄 그어질 건데 무시하셈 ㅇㅇ
      session.user.email = token.email || session.user.email;
      session.user.name = token.name || session.user.name;
      return session;
    },
  },
  
  session: {
    maxAge: 60 * 30, // 30분
    updateAge: 60 * 5, // 5분마다 세션 갱신
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/', // 쿠키가 전체 사이트에서 유효하도록 설정
      },
    },
  },

});

export { handler as GET, handler as POST };
