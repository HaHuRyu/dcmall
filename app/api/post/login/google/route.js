import { NextResponse } from 'next/server';
import { selectUserByGoogleEmail, updateSessionByGoogleEmail } from '../../../../_lib/db';
import { createSession } from '../../../../util/createSession';

export async function POST(req) {
  const { email, name, picture, givenName, familyName, locale, googleId } = await req.json();

  try {
    const existingUser = await selectUserByGoogleEmail(email);

    if(existingUser.status === 200){
      try{
        await createSession(email, updateSessionByGoogleEmail);
        return NextResponse.json({ message: '구글 로그인 성공', user: existingUser.nickname }, { status: 200 });
      }catch(err){
          console.error("구글 로그인 세션 생성 중 오류:", err);
          return NextResponse.json({ message: '구글 로그인 세션 생성 중 오류' }, { status: 500 });
      }
    }else if (existingUser.status === 201) {
        return NextResponse.json({message: '../createUser'}, {status: 201});
    } else {
      return NextResponse.json({ message: '사용자 확인 중 오류 발생' }, { status: 500 });
    }
  } catch (error) {
    console.error('구글 로그인 처리 중 오류:', error);
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}