import { NextResponse } from "next/server";

export async function POST(req) {
    const { searchText } = await req.json();

    try {
        // 검색어 전송
        const result = await fetch('http://localhost:8080/receiveSearch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                searchText: searchText
            })
        });
        if(!result.ok){
            throw console.error('Http error: '+result.status);
        }
        const response = await result.json();
        
        return NextResponse.json({recommendations: response}, {status: 200});
    } catch (error) {
        console.error("오류 발생:", error);
        return NextResponse.json({ error: "서버 오류 발생"} , {status: 500 });
    }
}