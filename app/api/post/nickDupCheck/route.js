import { NextResponse } from "next/server";
import { nickCheck } from "../../../_lib/db";

export async function POST(req) {
    const { usernick } = await req.json();

    try {
        const result = await nickCheck(usernick);

        return NextResponse.json({ message: result.message}, {status: result.status });
    } catch (error) {
        console.error("Nick check error:", error);
        return NextResponse.json({ message: "An error occurred while checking Nick"}, {status: 500 });
    }
}


