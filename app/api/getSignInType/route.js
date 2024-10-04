import { selectSignInMethod } from "../../_lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(){
    const cookieStore = await cookies();
    const sessionId = await cookieStore.get('next-session');
    try{
        const signInType = await selectSignInMethod(sessionId.value);
        return NextResponse.json({message: signInType}, {status: 200});
    }catch(err){
        console.error("getSignInType error: ", err);
        return NextResponse.json({message: "오류가 발생했습니다."}, {status: 500});
    }

}