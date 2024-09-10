
import {NextResponse} from "next/server"
import {setUserGoogleLogin, updateSessionByGoogleEmail} from "../../../../../_lib/db"
import { createSession } from '../../../../../util/createSession';


export async function POST(req){
    const {usernick, email} = await req.json();

    const result = await setUserGoogleLogin(email, usernick);
    if(result.status === 200){
        try{
            await createSession(email, updateSessionByGoogleEmail);
            return NextResponse.json({message: '구글 로그인 회원등록 성공!'}, {status: 200});
        }catch(err){
            console.error("구글 로그인 세션 생성 중 오류:", err);
            return NextResponse.json({ message: '구글 로그인 세션 생성 중 오류' }, { status: 500 });
        }
    }else{
        return NextResponse.json({message: '구글 로그인 회원등록 실패!'}, {status: 400});
    }
}