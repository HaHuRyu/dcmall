import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { cookies } from "next/headers";
import {selectSessionExpireTimeBySession, updateSessionExpireTimeBySession} from '../../_lib/db'

export async function POST(req) {
    try {
        const cookieStore = cookies();
        const sessionId = await cookieStore.get("next-session")?.value;
        const newSession = uuidv4();

        console.log("쿠키 가져오기: "+sessionId);
        
        // UTC 기준 현재 시간
        const now = new Date();
        // 1시간 후
        const maxTime = new Date(now.getTime() + 3600000);

        const res = await selectSessionExpireTimeBySession(sessionId);
        
        // DB에서 가져온 시간을 Date 객체로 변환
        const dbExpireTime = new Date(res.message);
        
        // 시간 차이 계산 (밀리초 단위)
        const timeDiff = dbExpireTime.getTime() - now.getTime();
        
        // 10분(600000 밀리초) 이상 차이가 나는지 확인
        if(res.status !== 200 || timeDiff >= 300000){
            return NextResponse.json(
                {message: "정상 세션이 아닙니다."}, 
                {status: res.status}
            );
        }

        console.log("새로운 세션: "+newSession+" // 구 세션: "+sessionId);

        // DB 쿼리 실행
        const result = await updateSessionExpireTimeBySession(sessionId, maxTime, newSession);

        if (result.status === 200) {
            const response = NextResponse.json({
                message: "세션 갱신 성공",
                sessionId: newSession,
                expiresAt: maxTime
            }, {status: 200});

            // 쿠키 설정
            response.cookies.set({
                name: 'next-session',
                value: newSession,
                path: '/',
                maxAge: 3600,
                httpOnly: true,
                secure: true,
                sameSite: 'lax'
            });

            return response;
        }

        return NextResponse.json(
            { message: "세션 갱신 실패" },
            { status: 500 }
        );

    } catch (error) {
        console.error("Session refresh error:", error);
        return NextResponse.json(
            { message: "세션 갱신 중 오류 발생" },
            { status: 500 }
        );
    }
}