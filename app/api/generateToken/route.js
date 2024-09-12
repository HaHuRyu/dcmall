import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { saveToken, selectUserId, certificationNotification } from '../../_lib/db';
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = cookies();
        const session = cookieStore.get('next-session');
        
        if (!session) {
            return NextResponse.json({ error: "세션이 없습니다." }, { status: 401 });
        }

        const num = await selectUserId(session.value);
        
        if (!num) {
            return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        const isAlreadyCertified = await certificationNotification(num);

        if (isAlreadyCertified) {
            // 이미 인증된 경우
            return NextResponse.json({ message: "이미 인증되었습니다." }, { status: 200 });
        } else {
            // 인증이 필요한 경우, 새 토큰 생성
            const token = uuidv4();
            await saveToken(token, num);
            return NextResponse.json({ token }, { status: 200 });
        }
    } catch (error) {
        console.error("토큰 생성 또는 확인 실패:", error);
        return NextResponse.json({ error: "처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}