import { NextResponse } from "next/server";
import { findPw } from "../../../_lib/db";

export async function POST(req) {
    try {
        const { id } = await req.json(); // JSON 형식으로 요청 본문 파싱 및 email 추출
        const { email } = await req.json();
        
        const result = findPw(id, email);

        return NextResponse.json({ message: result.message }, { status: result.status });
    } catch (error) {
        console.error("findID error:", error);
        return NextResponse.json({ message: "An error occurred while finding ID" }, { status: 500 });
    }
}
