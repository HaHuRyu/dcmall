// app/api/post/login/route.js
import { NextResponse } from "next/server";
import { password_check } from "../../../_lib/salt";
import { queryDatabase } from "../../../_lib/db";

export async function POST(req) {

  let res = NextResponse

  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const id = params.get("id");
    let userPw = params.get("password");
    
    const query = await queryDatabase(id);

    if(query.length > 0){
      const user = query[0]
      
      let answer = hash(user.password, userPw)
    
      if(answer == true){
        return res.json({ message: '로그인 성공'}, {status: 200});
      } else {
        return res.json({ message: '비밀번호가 일치하지 않습니다.' }, {status: 401} );
      }
    } else {
      return res.json({ message: '현재 입력하신 계정은 없는 계정입니다. 확인 후 다시 이용해주세요.' }, {status: 401});
    }

  } catch (error) {
    console.error("Request parsing error:", error);
    return res.json({ error: "오류 발생" }, { status: 400 });
  }
}

function hash(password, userPw) {

  return password_check(password, userPw)

}
