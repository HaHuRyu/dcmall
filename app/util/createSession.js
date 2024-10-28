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
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 3600,
            path: '/',
        });
    }
}


