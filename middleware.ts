import { NextRequest, NextResponse } from "next/server";

// Edge Runtime에서는 사용할 수 없는 Node.js 특정 API나 기능을 사용하기 위해 추가
// 꼭 필요한 경우에만 사용해야함. 아무대나 사용할 시 런타임 시간이 길어지는 문제점이 발생함.
export const runtime = 'nodejs'

/*
    미들웨어에서 직접 데이터를 보내는 것은 일반적인 패턴은 아닙니다. 
    미들웨어의 주요 목적은 요청을 가로채고, 필요한 경우 수정하거나 리디렉션하는 것
 */
export async function middleware(request: NextRequest){
    const response = NextResponse.next();
    const session = request.cookies.get('dcmall-session');
    
    if (!session && request.nextUrl.pathname.startsWith('/login')) {
        return response;
    } else if(!session){
        return NextResponse.redirect(new URL('/login/signIn', request.url));
    }

    
    if(session){
        // 세션이 있는 경우의 로직
        if (request.nextUrl.pathname.startsWith('/login')) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        if (request.nextUrl.pathname.startsWith('/keyword')) {
            // 키워드 페이지에 대한 추가 검증이 필요하다면 여기에 로직을 추가
            return NextResponse.next();
        }
        return NextResponse.next();
    }

}

export const config = {
    matcher: [
        '/keyword/:path*',
        '/login/:path*'
    ],
  }