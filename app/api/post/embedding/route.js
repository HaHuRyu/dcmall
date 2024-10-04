import { NextResponse } from "next/server";
import {getEmbedding} from "../../../util/openai-utils"
import { cookies } from "next/headers";
import { selectUserId } from "../../../_lib/db";

export async function POST(req){
    const obj = await req.json();
    let emtext;

    if("threshold" in obj ){    //:threshold가 어디에 포함된 거지?
        const cookieStore = cookies();
        const nextSession = cookieStore.get('next-session');

        const num = await selectUserId(nextSession.value);
        console.log("num : " + num)
        if(num > 0){
            const {title, threshold} = obj;
            emtext = getEmbedding(title, threshold, num);
        } else {
            const response = NextResponse.json({recommendations: "세션 변조 발생", check: 500});
            response.cookies.set('next-session', '',{
                expires: new Date(0),
                path: '/'
            });
            return response
        }
        
    } else {
        const {searchText} = obj;
        emtext = getEmbedding(searchText, "x");
    }
    return emtext;

}