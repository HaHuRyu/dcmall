import { NextResponse } from "next/server";
import {findID, compareSession, writeEmailToken} from "../../../../_lib/db";
import {sendEmail} from "../../../../_lib/email"
export async function POST(req){
    const {oldEmail, newEmail} = await req.json();
    const userId = await findID(oldEmail);
    const cookie = req.cookies.get('next-session')?.value;

    if(userId.status == 200){
        const cleanUserId = userId.message.split(' ')[2];
        const dbSession = await compareSession(cleanUserId);

        if(cookie == dbSession.message){
            // 해당 이메일로 인증번호를 날려야함
            const result = await writeEmailToken(cleanUserId, oldEmail);
            if(result.status == 200){
                let email_token = result.email_token
                try{
                    await sendEmail(newEmail, email_token, "DCMALL 이메일 변경 인증 메일")
                    return NextResponse.json({message: "인증 성공"}, {status: 200});
                }catch(error){
                    console.error("sendEmail error: ", error);
                    return NextResponse.json({message: "인증번호 발급 실패"}, {status: 400});
                }
            }else{
                return NextResponse.json({message: '기존 이메일을 확인 해주세요'}, {status: 400});
            }
    }else{
        return NextResponse.json({message: '인증 실패'}, {status: 400});
    }
     
    }else{
        return NextResponse.json({message: '인증 실패'}, {status: 400});
    }
}