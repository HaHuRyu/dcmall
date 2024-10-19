import {v4 as uuidv4} from 'uuid';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function createSession(email, registSession){
    
    const ENVIRONMENT = process.env.NODE_ENV || "development";
    const sessionId = uuidv4();
    const now = new Date(); // 현재 UTC 시간
    const maxTime = new Date(now.getTime() + 3600000); // 1시간 후의 시간

    const result = await registSession(email, sessionId, maxTime);
    if(result.status === 200){
        cookies().set('next-session', sessionId, {
            httpOnly: ENVIRONMENT === "production",
            secure: ENVIRONMENT === "production",
            sameSite: ENVIRONMENT === "production" ? "none" : "none",
            maxAge: 3600,
            path: '/',
        });
    }
}

export async function keepSession(sessionId, registSession) {
    
    const ENVIRONMENT = process.env.NODE_ENV || "development";
    const newSession = uuidv4();
    const now = new Date();
    const maxTime = new Date(now.getTime() + 3600000);
    
    console.log(`Attempting to register session ${sessionId} to expire at ${maxTime}`);
    const result = await registSession(sessionId, maxTime, newSession);
    
    if (result.status === 200) {
        const response = NextResponse.json({ message: "세션 등록 성공!" }, { status: 200 });

        response.cookies.set('next-session', newSession, {
            httpOnly: ENVIRONMENT === "production",
            secure: ENVIRONMENT === "production",
            sameSite: ENVIRONMENT === "production" ? "none" : "none",
            maxAge: 3600,
            path: '/',
        });
        
        console.log(response.cookies.get('next-session')); // 쿠키 값 확인
        return response;
    }
    
    return NextResponse.json({ message: "세션 등록에 실패했습니다." }, { status: 500 });
}

