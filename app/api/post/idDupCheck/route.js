import { NextResponse } from "next/server";
import { idCheck } from "../../../_lib/db";

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


