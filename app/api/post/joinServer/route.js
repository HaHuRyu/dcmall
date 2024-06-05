import { password_salt } from '../../../_lib/salt';
import {NextResponse} from "next/server"
import {setUser, finalIdCheck, nickCheck} from "../../../_lib/db"

//ID의 중복 확인과, pw 올바른 형식 한 번 더 확인하기
// @/ => 현재 앱의 최상위 경로
//클라이언트 단에서 변조할 가능성을 염두해 서버에서 이중체크(크로스체크)
export async function POST(req){
    const text = await req.text();
    const params = new URLSearchParams(text);

    let userId = params.get("inputID");
    let userPw = params.get("inputPW");
    let Email = params.get("email");
    let nickName = params.get("inputNickname");

    const safePw = await finalPasswordCheck(userPw);
    const safeId = await finalIdCheck(userId);  //await으로 동기처리를 해 이 두 부분이 확실하게 실행된 후에 아래가 진행되도록 바꾼다.
    const safeNick = await nickCheck(nickName);

    if(safeId && safePw && safeNick){
        var hashPw = password_salt(userPw)
        //DB에 저장하는 부분을 집어 넣자
        setUser(userId, hashPw, Email, nickName);

        return NextResponse.json({message : "회원가입 성공!"}, {status : 200});
    }
    else{
        return NextResponse.json({message : "ID와 비밀번호를 다시 확인해주세요."}, {status : 400});
    }
}



function finalPasswordCheck(password){
    //정규표현식 영문 포함 + 숫자 포함 + 특수문자 + 길이 8자리 이상 문자열(반드시 모두 포함)
    const specialChars = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    return specialChars.test(password);
}