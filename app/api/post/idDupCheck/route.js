import { NextResponse } from "next/server";
import { getConnection } from "../../../_lib/db";

export async function POST(req) {
    const { inputID } = await req.json();

    try {
        const result = await idCheck(inputID);
        return NextResponse.json({ message: result.message }, { status: result.status });
    } catch (error) {
        console.error("ID check error:", error);
        return NextResponse.json({ message: "An error occurred while checking ID" }, { status: 500 });
    }
}

async function idCheck(id) {
    // 정규식을 사용하여 한글이 포함되어 있는지 확인
    const hasHangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(id);

    // id도 나름의 기준이 존재하겠지만, 일단 띄어쓰기가 없고 아무것도 안 적은 방식 외에는 모두 OK로 할 예정(임시)
    if (id !== null && !id.includes(" ") && id.length <= 50 && !hasHangul) {
        const connection = getConnection();

        const query = "SELECT COUNT(id) AS count FROM user WHERE id = ?";

        return new Promise((resolve, reject) => {
            connection.query(query, [id], (err, results) => {
                if (err) {
                    console.error("Database query error from idDupCheck: ", err);
                    reject({ message: "Database query error", status: 500 });
                } else {
                    const count = results[0].count;

                    if (count === 0) {
                        resolve({ message: "You can use this ID", status: 200 });
                    } else {
                        resolve({ message: "ID already exists", status: 200 });
                    }
                }
            });
        });
    }

    throw { message: "Invalid ID format", status: 400 };
}
