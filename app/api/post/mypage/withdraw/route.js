import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import {password_check} from "../../../../_lib/salt";
import { queryDatabase, selectuserinfoByNum, selectSessionByGoogleEmail, deleteCustomUser, deleteGoogleUser } from "../../../../_lib/db";

export async function POST(req){
    try {
        const {id, pw, email, type} = await req.json();
        const cookieStore = cookies();
        const sessionId = cookieStore.get('next-session')?.value;
        console.log("Received data:", { id, pw, email, type, sessionId });

        if(type === '0'){  // 문자열로 비교
            if(id == 'admin'){
                return NextResponse.json({message: "관리자는 회원탈퇴할 수 없습니다."}, {status: 403});
            }
            const user = await queryDatabase(id);
            if(!user || user.length === 0){
                return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 404});
            }
            const userPw = user[0].password;
            const salt = user[0].salt;
            const isMatch = await password_check(userPw, pw, salt);
            console.log("Password match result:", isMatch);
            if(!isMatch){
                return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 401});
            }else{
                const result = await selectuserinfoByNum(user[0].num);
                if(result == null){
                    return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 404});
                }
    
                if(result.email != email || sessionId != result.sessionId){
                    return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 401});
                }else{
                    const result = await deleteCustomUser(user[0].num);
                    if(result.status === 200){
                        await deleteSession();
                        return NextResponse.json({message: "회원탈퇴 성공"}, {status: 200});
                    }else{
                        return NextResponse.json({message: "회원탈퇴 실패"}, {status: 400});
                    }
                }
            }
        }
        else{
            console.log("Processing Google login withdrawal");
            const dbSession = await selectSessionByGoogleEmail(email);
            console.log("selectSessionByGoogleEmail result:", dbSession);
            if(!dbSession || !dbSession.sessionId){
                return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 404});
            }
            const dbSessionId = dbSession.sessionId;

            if(dbSessionId !== sessionId){
                return NextResponse.json({message: "입력하신 정보가 올바르지 않습니다."}, {status: 401});
            }else{
                const result = await deleteGoogleUser(email);
                if(result.status === 200){
                    await deleteSession();
                    return NextResponse.json({message: "회원탈퇴 성공"}, {status: 200});
                }else{
                    return NextResponse.json({message: "회원탈퇴 실패"}, {status: 400});
                }
            }
        }
    } catch(error){
        console.error("Error in withdraw route:", error);
        console.error("Error stack:", error.stack);
        return NextResponse.json({message: "회원탈퇴 실패: " + error.message}, {status: 500});
    }
}

async function deleteSession(){
    cookies().delete('next-session');
}