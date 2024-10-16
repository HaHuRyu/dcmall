import { NextRequest, NextResponse } from "next/server";

// Node.js 런타임 설정 (Edge 런타임을 사용하지 않기 위함)
export const runtime = 'nodejs';

let lastFetchTime = 0; // 마지막 API 호출 시간을 저장하는 변수
const FETCH_INTERVAL = 1 * 60 * 1000; // 5분 (밀리초 단위)

// testFetch 함수는 모든 경로에서 실행
const testFetch = async (sessionId: string | undefined) => {
    if (!sessionId) return;
    const now = Date.now();

    // 마지막 요청 시간으로부터 FETCH_INTERVAL이 지나지 않았는지 확인
    if (now - lastFetchTime > FETCH_INTERVAL) {
        try {
            console.log("API 요청을 보냅니다.");
    
            const res = await fetch("http://localhost:3000/api/sessionExpireTime", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId })
            });
    
            if (res.status === 200) {
                lastFetchTime = now; // 성공적으로 호출했으므로 현재 시간을 업데이트
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }
}

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('next-session');

    // 1. 모든 경로에서 testFetch 실행
    await testFetch(session?.value);

    // 2. 특정 경로('/keyword', '/login')에서만 추가 로직 실행
    const pathname = request.nextUrl.pathname;

    // '/login' 또는 '/keyword' 경로에서만 동작하는 로직
    if (pathname.startsWith('/keyword') || pathname.startsWith('/login')) {
        const response = NextResponse.next();

        // 세션이 없는 경우 /login으로 리다이렉트
        if (!session && !pathname.startsWith('/login')) {
            return NextResponse.redirect(new URL('/login/signIn', request.url));
        }

        // 세션이 있는 경우, /login으로 접근 시 메인 페이지로 리다이렉트
        if (session && pathname.startsWith('/login')) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // 그 외 경로에서는 계속 진행
        return response;
    }

    // 다른 경로는 그대로 진행
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/:path*', // 모든 경로에서 testFetch 실행
    ],
};
