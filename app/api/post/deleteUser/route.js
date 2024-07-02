import { getPasswordById, deleteUser } from '../../../_lib/db';
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

export async function POST(req) {
    try {
        const { id, password, confirm } = await req.json();

        if (id === 'admin') {
            return NextResponse.json({ message: "이 아이디는 삭제할 수 없습니다." }, { status: 500 });
        } else {
            if (!confirm) {
                const isSame = await verifyPassword(id, password);

                if (isSame) {
                    return NextResponse.json({ message: "회원탈퇴를 진행하시겠습니까?", confirm: true }, { status: 200 });
                } else {
                    return NextResponse.json({ message: "아이디나 비밀번호를 다시 확인해주세요." }, { status: 500 });
                }
            } else {
                const isSame = await verifyPassword(id, password);

                if (isSame) {
                    const cookieStore = await cookies();

                    await cookieStore.set('next-session', '', { 
                        expires: new Date(0),
                        path: '/'
                      });

                    const result = await deleteUser(id);

                    if (result.status === 200) {
                        return NextResponse.json({ message: result.message}, { status: 200 });
                    } else {
                        return NextResponse.json({ message: result.message }, { status: 400 });
                    }
                } else {
                    return NextResponse.json({ message: "아이디나 비밀번호를 다시 확인해주세요." }, { status: 500 });
                }
            }
        }
    } catch (error) {
        console.error("deleteUser Error: " + error);
        return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
