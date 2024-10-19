import {v4 as uuidv4} from 'uuid';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function createSession(email, registSession){
    const sessionId = uuidv4();
    const now = new Date(); // 현재 UTC 시간
    const maxTime = new Date(now.getTime() + 3600000); // 1시간 후의 시간

    const result = await registSession(email, sessionId, maxTime);
    if(result.status === 200){
        cookies().set('next-session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 3600,
            path: '/',
        });
    }
}

export async function keepSession(sessionId, registSession) {
    const now = new Date(); // 현재 UTC 시간
    const maxTime = new Date(now.getTime() + 3600000); // 1시간 후의 시간
  
    const result = await registSession(sessionId, maxTime);
  
    if (result.status === 200) {
      // 응답 객체 생성
      const response = NextResponse.json({ message: "세션 갱신 성공!" }, { status: 200 });
  
      // 응답 객체에 쿠키 설정
      response.cookies.set('next-session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, // 1시간
        sameSite: 'Lax',
        path: '/',
      });
  
      return response;
    }
  
    return NextResponse.json({ message: "세션 갱신에 실패했습니다." }, { status: 500 });
  }