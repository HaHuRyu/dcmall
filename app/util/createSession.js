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

export async function keepSession(sessionId, registSession) {   //F12 세션의 expires가 갱신이 안 됨
    const now = new Date(); // 현재 UTC 시간
    const maxTime = new Date(now.getTime() + 3600000); // 1시간 후의 시간

    const result = await registSession(sessionId, maxTime);
    
    // registeSession의 결과가 200일 경우에만 쿠키를 설정
    if (result.status === 200) {
        // 새로운 쿠키 설정
        const res = cookies().set('next-session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600, // 새로 설정할 유효 시간
            sameSite: 'Lax',
            path: '/',
        });
        console.log("새로운 세션 만들기: "+res);
        return NextResponse.json({message: "세션 등록 성공!"}, {status: 200});
    }
    
    // 만약 세션 등록이 실패했을 경우 적절한 응답을 반환
    return NextResponse.json({ message: "세션 등록에 실패했습니다." }, { status: 500 });
}
