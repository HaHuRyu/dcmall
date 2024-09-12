import { NextResponse } from "next/server";
import { resetSessionId } from "../../../../_lib/db";
import { cookies } from "next/headers";

export async function POST(req){
    const { sessionCookie } = await req.json();

    const result = await resetSessionId(sessionCookie);

    if(result.status === 200){
        cookies().delete('next-session');
        return NextResponse.json({ message: "로그아웃 성공", status: result.status });
    }else{
        return NextResponse.json({ message: "로그아웃 실패", status: result.status });
    }
}
