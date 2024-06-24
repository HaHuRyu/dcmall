import { NextResponse } from "next/server";
import { password_check } from "../../../_lib/salt";
import { queryDatabase, findSessionById, updateSessionId} from "../../../_lib/db";
import { v4 as uuidv4 } from 'uuid';

//JSON에 한글이 들어가면 구문 오류가 발생한다.
export async function POST(req) {
  try {
    const {id, password} = await req.json();
    const query = await queryDatabase(id);

    if(query.length > 0){
      const user = query[0]
      
      let answer = hash(user.password, password)
    
      if(answer == true){
        while(true){
          const newSessionId = await createSessionId();
          const uniqueSessionId = await findSessionById(id, newSessionId);

          if(uniqueSessionId.status === 200){
            const user = {sessionID: newSessionId};
            await updateSessionId(id, newSessionId);

            const response = NextResponse.json({ message: '로그인 성공' }, { status: 200 });
            response.cookies.set('next-session', JSON.stringify(user), {
              httpOnly: true,
              maxAge: 60 * 60,
              path: '/'
            });
            return response;
          }
        }
      } else {
        return NextResponse.json( {message: '아이디나 비밀번호가 일치하지 않습니다.'}, {status: 401} );
      }
    } else {
      return NextResponse.json({ message: '현재 입력하신 계정은 없는 계정입니다. 확인 후 다시 이용해주세요.'}, {status: 401});
    }

  } catch (error) {
    console.error("Request parsing error:", error);
    return NextResponse.json({ message: "오류 발생"} , {status: 400 });
  }
}

function hash(password, userPw) {

  return password_check(password, userPw)

}

async function createSessionId() {
  const sessionId = await uuidv4();

  return sessionId;
}