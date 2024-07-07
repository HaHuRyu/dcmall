import { NextResponse } from "next/server";
import { resetSessionId } from "../../../_lib/db";

export async function POST(req) {
  try {
    const { userSession } = await req.json();

    // DB에서 세션 ID를 NULL로 업데이트
    const updateResult = await resetSessionId(userSession);
    if (updateResult.status !== 200) {
      throw new Error(updateResult.message);
    }

    // 응답 객체 생성
    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

    // 쿠키 삭제
    response.cookies.set('next-session', '', { 
      expires: new Date(0),
      path: '/'
    });

    return response;
  } catch (error) {
    console.error("로그아웃 오류!", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
