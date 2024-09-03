
import {NextResponse} from "next/server"
import {setUserGoogleLogin} from "../../../../../_lib/db"

/*
이 곳에 왔다는 것은 구글 로그인을 한 새로운 유저가 회원 등록을 하기 위해 왔다...

1. 닉네임이 결정됐다면, user의 id와 password는 공백 또는 임의의 문자열로 만들 것이며, signinType은 구글을 의미하는 1로 집어넣어 줄 것이다.
2. 세션 만드는 건 로그인 쪽에서...
*/
export async function POST(req){
    const {usernick, email} = await req.json();

    const result = await setUserGoogleLogin(email, usernick);
    if(result.status === 200){
        return NextResponse.json({message: '구글 로그인 회원등록 성공!'}, {status: 200});
    }else{
        return NextResponse.json({message: '구글 로그인 회원등록 실패!'}, {status: 400});
    }
}