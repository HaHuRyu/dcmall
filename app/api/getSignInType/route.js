import { selectSignInMethod } from "../../_lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(){
    const cookieStore = await cookies();
    const sessionId = await cookieStore.get('next-session');
    try{
        //새로 바꾼 게 DB에만 적용되고, 쿠키에는 적용이 안 돼서 생기는 미친 문제 24-10-18
        const signInType = await selectSignInMethod(sessionId.value);
        return NextResponse.json({message: signInType}, {status: 200});
    }catch(err){
        console.error("getSignInType error: ", err);
        return NextResponse.json({message: "오류가 발생했습니다."}, {status: 500});
    }

}