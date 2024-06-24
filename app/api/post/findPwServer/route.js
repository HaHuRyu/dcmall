import { NextResponse } from "next/server";
import { updatePassword } from "../../../_lib/db";

export async function POST(req) {
    try {
        const {token}  = await req.json(); // JSON 형식으로 요청 본문 파싱 및 email 추출
        console.log(token)
        const result = await updatePassword(token);

        console.log(result.message)
       
        return NextResponse.json({ message: result.message }, { status: result.status });
    } catch (error) {
        console.error("findPW error:", error);
        return NextResponse.json({ message: "An error occurred findPw" }, { status: 500 });
    }
}
