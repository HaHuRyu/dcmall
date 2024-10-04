import { NextResponse } from "next/server";
import { updateEmail } from "../../../../_lib/db";
export async function POST(req){
    const {emailToken, oldEmail, newEmail} = await req.json();
    const result = await updateEmail(emailToken, oldEmail, newEmail);
    return NextResponse.json({message: result.message}, {status: result.status});
}