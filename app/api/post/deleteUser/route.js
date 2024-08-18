import { getPasswordById, deleteUser, compareSession} from '../../../_lib/db';
import { NextResponse } from "next/server";
import { password_check } from "../../../_lib/salt";
import {cookies} from "next/headers";

// 비밀번호 확인 함수
async function verifyPassword(id, password) {
    const res = await getPasswordById(id);
    if (res.status === 200) {
        return password_check(res.message, password);
    }
    return false;
}

async function verifySession(id, session) { //cookieStore.get('next-session')?.value => {"sessionID":"8c0a18e8-5810-4014-b08c-ae26f179241b"} 이런 식으로 들어가서 정제해야함;;
    const res = await compareSession(id); 
    // 서버측 세션과 클라이언트측 세션의 공백 제거 후 비교
    const serverSession = res.message.trim();
    const clientSession = JSON.parse(session).sessionID.trim();
    console.log("세션비교 결과: "+serverSession+"// "+clientSession);
    if (res.status === 200) {
        return serverSession == clientSession;
    }

    return false;
}
export async function POST(req) {
    try {
        const { id, password, confirm } = await req.json();

        if (id === 'admin') {
            return NextResponse.json({ message: "이 아이디는 삭제할 수 없습니다." , status: 500 });
        } else {
            if (!confirm) {
                const isSame = await verifyPassword(id, password);

                if (isSame) {
                    return NextResponse.json({ message: "회원탈퇴를 진행하시겠습니까?", confirm: true , status: 200 });
                } else {
                    return NextResponse.json({ message: "아이디나 비밀번호를 다시 확인해주세요." , status: 500 });
                }
            } else {
                const isSame = await verifyPassword(id, password);

                if (isSame) {
                    const cookieStore = cookies();
                    const session = cookieStore.get('next-session')?.value || 'no exist'; // 쿠키 값 추출

                    const compareResult = await verifySession(id, session); // 추출한 문자열을 전달
                    if(compareResult == true){
                        const result = await deleteUser(JSON.parse(session).sessionID.trim());  //원래 잘돼던 cookieStroe가 next-session=%7B%22sessionID%22%3A%22d95d584a-3dfe-42c7-be5d-40f500c54e06%22%7D; Path=/ 이런 식으로 들어져서 이렇게 받아와야함
                                          
                        await cookieStore.set('next-session', '', { 
                            expires: new Date(0),
                            path: '/'
                          });

                        if (result.status === 200) {
                            return NextResponse.json({ message: result.message, status: 200 });
                        }else{
                            return NextResponse.json({ message: result.message, status: 400 });
                        }
                    }else{
                        return NextResponse.json({ message: "타인의 아이디는 삭제할 수 없습니다!", status: 400 });
                    }
                    
                } else {
                    return NextResponse.json({ message: "아이디나 비밀번호를 다시 확인해주세요.", status: 500 });
                }
            }
        }
    } catch (error) {
        console.error("deleteUser Error: " + error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다.", status: 500 });
    }
}
