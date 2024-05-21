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
      // 설명: 원래의 토큰 방식에서는 토큰을 발급하여 클라이언트의 쿠키에 저장하고,
      // 동시에 서버에서 그 토큰을 데이터베이스에 저장하여 이후 요청에서 비교하는 방식이다.
      // 하지만, JWT는 자체적으로 서명된 토큰이기 때문에 서버 측 데이터베이스 조회 없이도
      // 토큰의 유효성을 확인할 수 있다. 따라서 JWT를 사용하면 로그인 시 데이터베이스에서
      // 사용자 ID와 비밀번호를 확인하고, 이후에는 토큰만 검증하면 된다. 이 authorize 함수에서는
      // 이미 DB에서 ID와 비밀번호를 확인했다고 가정하고, JWT 토큰만 발급하여 반환한다.
      async authorize(credentials) {  //POST여야만 한다
        // 사용자 인증 로직
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
