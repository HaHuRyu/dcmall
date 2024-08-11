import { password_salt } from '../../../_lib/salt';
import { NextResponse } from "next/server";
import { resetPassword } from "../../../_lib/db";

export async function POST(req) {
    const { resetPw, resetToken } = await req.json();
    let result;

    try {
        var hashPw = password_salt(resetPw)
            
        result = await resetPassword(resetToken, hashPw);
        
        return NextResponse.json({ message: result.message }, { status: result.status });
    } catch (error) {
        console.error("PW Change error:", error);
        return NextResponse.json({ message: "An error occurred while change pw" }, { status: 500 });
    }
}


