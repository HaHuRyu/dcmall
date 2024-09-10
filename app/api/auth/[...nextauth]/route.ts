// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { password_check } from '../../../_lib/salt'; // 비밀번호 확인 함수
import { queryDatabase } from '../../../_lib/db'; // 사용자 데이터베이스 조회 함수
import { JWT } from "next-auth/jwt"


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
              ...user, // 기존 user 객체의 내용을 복사
              email: credentials.email, // 이메일 추가
              name: user.name // 닉네임 추가
            };
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
      }
      return session
    },
  },
  // 기타 설정...
})

export { handler as GET, handler as POST };
