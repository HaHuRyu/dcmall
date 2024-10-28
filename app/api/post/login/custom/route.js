import {NextResponse} from "next/server"
import {queryDatabase, updateSessionId, selectCustomUser} from "../../../../_lib/db"
import {password_check} from "../../../../_lib/salt"
import { createSession } from '../../../../util/createSession';

export async function POST(req){
    const {email, password} = await req.json();
    console.log("들어온 값: "+email+" "+password);
    
    const user = await queryDatabase(email);
    if(!user){
        return NextResponse.json({message : "존재하지 않는 아이디입니다."}, {status : 404});
    }
    const userNick = await selectCustomUser(email);

    const dbPw = user[0].password;
    const salt = user[0].salt;
    const safePw = password_check(dbPw, password, salt);

    if(!safePw){
        return NextResponse.json({message : "비밀번호가 일치하지 않습니다."}, {status : 401});
    }else{
        try{
            await createSession(email, updateSessionId);
            return NextResponse.json({message : "로그인 성공!", user: userNick.user.nickname}, {status : 200});
        }catch(err){
            console.error("커스텀 로그인 세션 생성 중 오류:", err);
            return NextResponse.json({ message: '커스텀 로그인 세션 생성 중 오류' }, { status: 500 });
        }   
    }
}