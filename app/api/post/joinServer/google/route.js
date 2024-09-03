
import {NextResponse} from "next/server"
import {selectUserByGoogleEmail} from "../../../../_lib/db"

/*
구글 로그인을 한 유저의 회원가입을 진행할 것이다.
1. userInfo의 email을 통한 조회를 통해 존재한다면 빠꾸를 먹일 것이다.
1-1. 존재한다면 이 닉네임과 유저 정보를 가지고 마이페이지 세팅을 해주겠지...
2. 존재하지 않는다면 사용할 닉네임을 물어보는 페이지로 이동시킬 것이다.
2-1 닉네임 결정 url로 옮겨주고 그곳에서 닉네임 중복을 통과한다면 다음 서버로 넘어가서 회원가입 절차를 진행 할 것이다.
3. 닉네임이 결정됐다면, user의 id와 password는 공백 또는 임의의 문자열로 만들 것이며, signinType은 구글을 의미하는 1로 집어넣어 줄 것이다.
4. userinfo에도 가진 정보대로 집어넣을 것이며, 세션의 경우 구글에서 따로 발급해주는 세션이 있다면 그걸 집어넣을 것이고 아닐 경우에는 내가 여기서 만들어서
밖의 ClientComponent에게 넘겨주어 세션을 세팅할 것이다.
*/
export async function POST(req){
    const {email} = await req.json();
    console.log("구글 로그인 이메일 확인: "+email);

    const existUser = await selectUserByGoogleEmail(email);
    if(existUser.status === 200){
        return NextResponse.json({nickname: existUser.nickname}, {status: 200});
    }

    if(existUser.status === 201){
        return NextResponse.json({url: '/createUser'}, {status: 201});
    }
}