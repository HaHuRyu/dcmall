import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY; // 환경 변수로 SECRET_KEY 관리

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'login', // 사용자 지정 이름 설정 (로그인 경로)
      credentials: {
        id: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 사용자 인증 로직
        console.log("authorize!!!");
        // 예시로 간단하게 처리 - 실제로는 데이터베이스 등에서 사용자 인증 로직을 수행
        const user = { id: credentials.id, name: credentials.id };

        if (user) {
          // 사용자 인증 성공 시 JWT 토큰 생성
          const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
          return { ...user, token }; // 사용자 객체와 토큰 반환
        } else {
          // 사용자 인증 실패 시 null 반환
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // JWT 토큰에 사용자 정보 추가
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      // 세션에 JWT 토큰 정보 추가
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.token = token.token;
      return session;
    }
  },
  secret: SECRET_KEY, // NextAuth 비밀 키 설정
  jwt: {
    secret: SECRET_KEY, // JWT 비밀 키 설정
  }
});
