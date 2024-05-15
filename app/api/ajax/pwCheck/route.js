import { NextResponse } from 'next/server'

export async function POST(req) {
    try {
        const { password } = await req.json(); // Adjusted this line to properly parse the request body

        console.log('input: ' + password);

        let result = checkPassword(password);

        if (result) {   //여기서 checkBox의 문구를 그대로 보내도 되나, 추후 작업의 편의성과 너무 길어서 이렇게 표현
            return NextResponse.json({ message: "safe" }, { status: 200 });
        }
        else {
            return NextResponse.json({ message: "dangerous" }, { status: 200 });
        }
        
    } catch (Error) {
        console.log("pwCheck Error!: " + Error);
    }

}

function checkPassword(password) {
    //정규표현식 영문 포함 + 숫자 포함 + 특수문자 + 길이 8자리 이상 문자열(반드시 모두 포함)
    const specialChars = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    return specialChars.test(password);
}
