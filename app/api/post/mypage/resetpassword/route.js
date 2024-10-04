import { checkPasswordBySessionId, mypageResetPassword } from "../../../../_lib/db";
import { NextResponse } from "next/server";
import { password_check, password_salt } from "../../../../_lib/salt";
import {cookies} from 'next/headers';
export async function POST(req){
    const {oldPw, newPw} = await req.json();
    const sessionId = cookies().get('next-session');
    const password = await checkPasswordBySessionId(sessionId.value);

    if(password.id == 'admin'){
        return NextResponse.json({message: '관리자는 비밀번호를 변경할 수 없습니다.'}, {status: 400});
    }

    if(password != null){
        if(password_check(password.password, oldPw)){
            const newPwSalt = password_salt(newPw);
            const result = await mypageResetPassword(password.num, newPwSalt);
            if(result.status === 200){
                return NextResponse.json({message: result.message}, {status: result.status});
            }
            else{
                return NextResponse.json({message: result.message}, {status: result.status});
            }
        }
        else{
            return NextResponse.json({message: '비밀번호가 일치하지 않습니다.'}, {status: 400});
        }
    }else{
        return NextResponse.json({message: '로그인이 필요합니다.'}, {status: 401});
    }

}