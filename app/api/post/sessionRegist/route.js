<<<<<<< HEAD
import { NextResponse } from "next/server";
import { updateSessionByGoogleEmail, updateSessionId } from "../../../_lib/db";

export async function POST(req) {
  const { email, provider, accessToken } = await req.json();

  try {
    if (provider === 'google') {
      const result = await updateSessionByGoogleEmail(email, accessToken);
      if (result.status === 200)
        return NextResponse.json({ message: '구글 로그인 세션 등록 완료!' }, { status: 200 });
      else
        return NextResponse.json({ message: '구글 로그인 세션 등록 실패!' + result.message }, { status: 400 });
    } else {
      const result = await updateSessionId(email, accessToken);
      if (result.status === 200)
        return NextResponse.json({ message: '커스텀 로그인 세션 등록 완료!' }, { status: 200 });
      else
        return NextResponse.json({ message: '커스텀 로그인 세션 등록 실패!' + result.message }, { status: 400 });
=======
export async function POST(req){
    const {email, provider} = await req.json();
    const cookieStore = cookies();
    const nextSession = cookieStore.get('next-auth.session-token');

    if(!nextSession) {
        return NextResponse.json({message: '세션이 없습니다.'}, {status: 400});
    }

    try {
        let result;
        if(provider === 'google'){
            result = await updateSessionByGoogleEmail(email, nextSession.value);
        } else {
            result = await updateSessionId(email, nextSession.value);
        }

        if(result.status === 200) {
            return NextResponse.json({message: `${provider} 로그인 세션 등록 완료!`}, {status: 200});
        } else {
            return NextResponse.json({message: `${provider} 로그인 세션 등록 실패: ${result.message}`}, {status: 400});
        }
    } catch(error) {
        return NextResponse.json({message: `${provider} 로그인 세션 등록 실패: ${error.message}`}, {status: 500});
>>>>>>> c99fd52455c07f8c5cf33c017e63d06dedd10c4b
    }
  } catch (error) {
    console.error("Session registration error:", error);
    return NextResponse.json({ message: '세션 등록 중 오류 발생' }, { status: 500 });
  }
}