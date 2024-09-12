import {password_salt, password_check} from "../../../_lib/salt";
import { queryDatabase, selectuserinfoByNum, selectSessionByGoogleEmail } from "../../../_lib/db";
import { cookies } from "next/headers";

export async function POST(req){
    const {id, pw, email, type} = await req.json();
    try{
        if(type === 0){
            const user = await queryDatabase(id);
            if(user.length === 0){
                return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 404});
            }
            const userPw = user[0].pw;
            const isMatch = await password_check(userPw, pw);
            if(!isMatch){
                return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 401});
            }else{
                const result = await selectuserinfoByNum(user[0].num);
                if(result.length === 0){
                    return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 404});
                }
                const userInfo = result[0];
                const cookieStore = await cookies();
                const sessionId = cookieStore.get('next-session');
    
                if(userInfo.email !== email || sessionId !== userInfo.sessionId){
                    return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 401});
                }else{
                    return NextResponse.json({message: "회원탈퇴 성공"}, {status: 200});
                }
                
            }
        }
        else{
            const dbSession = await selectSessionByGoogleEmail(email);
            if(dbSession.length === 0){
                return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 404});
            }
            const dbSessionId = dbSession[0].sessionId;
            const cookieStore = await cookies();
            const sessionId = cookieStore.get('next-session');
            if(dbSessionId !== sessionId){
                return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 401});
            }else{
                return NextResponse.json({message: "회원탈퇴 성공"}, {status: 200});
            }
        }
    }catch(error){
        return NextResponse.json({message: "회원탈퇴 실패"}, {status: 500});
    }
   
}