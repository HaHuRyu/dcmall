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
    // async jwt({ token, account }) {
    //   if (account) {
    //     token.provider = account.provider;
    //   }
    //   return token;
    // },
    async session({ session, token}) {
      console.log("옘병 났다: "+JSON.stringify(session)+"\n"+JSON.stringify(token));
      if (token.provider === 'google') {
        session.provider = token.provider;
        session.user.email = token.email;
        session.user.name = token.name;
      } 
        
        return session;
    }
  },

  pages: {
    signIn: '/login/signin', // 사용자 정의 로그인 페이지
    // 다른 페이지 설정
  },
  
  session: {
    maxAge: 1 * 24 * 60 * 60,
  },
  //아무튼 세션 바뀌는 건 이새끼가 원인
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/', // 쿠키가 전체 사이트에서 유효하도록 설정
      },
    },
  },

});

export { handler as GET, handler as POST };
