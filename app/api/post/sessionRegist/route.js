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
    }
}