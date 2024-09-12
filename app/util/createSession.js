import {v4 as uuidv4} from 'uuid';
import { cookies } from 'next/headers';

export async function createSession(email, registSession){
    const sessionId = uuidv4();
    const result = await registSession(email, sessionId);
    if(result.status === 200){
        cookies().set('next-session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600,
            path: '/',
        });
    }
    
}