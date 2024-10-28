import { NextRequest, NextResponse } from "next/server";

// Node.js 런타임 설정 (Edge 런타임을 사용하지 않기 위함)
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('next-session');
    const response = NextResponse.next();

    // 2. 특정 경로('/keyword', '/login')에서만 추가 로직 실행
    const pathname = request.nextUrl.pathname;

    // '/login' 또는 '/keyword' 경로에서만 동작하는 로직
    if (pathname.startsWith('/keyword') || pathname.startsWith('/login')) {

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
