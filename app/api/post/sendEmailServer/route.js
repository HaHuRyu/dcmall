import { NextResponse } from "next/server";
import { writeEmailToken } from "../../../_lib/db";
import {sendEmail} from "../../../_lib/email"

export async function POST(req) {
    try {
        const { id, email } = await req.json(); // JSON 형식으로 요청 본문 파싱 및 email 추출

        const result = await writeEmailToken(id, email);
        let answer
        if(result.status == 200){
            let email_token = result.email_token
            let useremail = result.email

            answer = await sendEmail(useremail, email_token)
            
            console.log('adsadsa'+ answer.message)
            
        }
        return NextResponse.json({ message: answer.message, status: answer.status });
    } catch (error) {
        console.error("writeEmailToken error:", error);
        return NextResponse.json({ message: "An error occurred findPw", status: 500 });
    }
}
