import { NextResponse } from 'next/server';
import { updateSessionByGoogleEmail, updateSessionId } from '../../../_lib/db';

export async function POST(req) {
  try {
    const { email, provider, sessionId } = await req.json();

    if (!email || !provider || !sessionId) {
      return NextResponse.json({ message: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    let result;
    if (provider === 'google') {
      result = await updateSessionByGoogleEmail(email, sessionId);
    } else {
      result = await updateSessionId(email, sessionId);
    }

    if (result.status === 200) {
      return NextResponse.json({ message: `${provider} 로그인 세션 등록 완료!` }, { status: 200 });
    } else {
      return NextResponse.json({ message: `${provider} 로그인 세션 등록 실패: ${result.message}` }, { status: 400 });
    }
  } catch (error) {
    console.error('세션 동기화 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}