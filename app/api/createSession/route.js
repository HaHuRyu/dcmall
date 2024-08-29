import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { selectSessionByGoogleEmail, updateSessionByGoogleEmail } from "../../_lib/db";

/*구글 로그인 전용 세션 생성기
1. email을 받아서 유저의 세션이 존재하는 지 확인하고 (세션 id를 뽑아서 확인)
1-1 있으면 그냥 return 해주고, 없으면 세션을 새로 생성해준다.

//세션을 내가 추가적으로 만들필요도 없었고, 쿠키에 있는 next-auth.session.token을 쓰면 되는 거였다~ 1-1 논리 폐기 만들지 마라
*/
/*240829 여기서 무한 루프를 도는 문제가 발생 */
export async function POST(req) {
    const { email } = await req.json();
    try {
        const result = await selectSessionByGoogleEmail(email);
        console.log("세션 조회 결과: "+JSON.stringify(result));
        
        if (result.status === 200) { //세션이 존재하는 경우 그냥 세션 리턴
            return NextResponse.json({ sessionId: result.sessionId }, { status: 200 });
        }
        
        if (result.status === 404) {  //세션이 존재하지 않는 경우
            const newSessionId = await createSessionId();
            const uniqueSessionId = await updateSessionByGoogleEmail(email, newSessionId);

            console.log("유니크: "+JSON.stringify(uniqueSessionId)+" // newSessionId: "+newSessionId);

            if (uniqueSessionId.status === 200) {
                const user = { sessionID: newSessionId };

                const response = NextResponse.json({ sessionId: '로그인 성공' }, { status: 200 });
                response.cookies.set('next-session', JSON.stringify(user), {
                    httpOnly: true,
                    maxAge: 60 * 60,
                    path: '/'
                });
                return response;

            } else {
                throw new Error('Failed to update session in the database');
            }
        }

        return NextResponse.json({ message: "Unexpected result from session check" }, { status: 500 });

    } catch (error) {
        console.error("Request parsing error:", error);
        return NextResponse.json({ message: "오류 발생", error: error.message }, { status: 400 });
    }
}

async function createSessionId() {
    return uuidv4();
}
