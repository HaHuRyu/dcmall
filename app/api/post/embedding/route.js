import { NextResponse } from "next/server";
import {getEmbedding} from "../../../util/openai-utils"
import { cookies } from "next/headers";
import { selectUserId } from "../../../_lib/db";

export async function POST(req){
    const obj = await req.json();
    let emtext;

    if("threshold" in obj ){
        const cookieStore = cookies();
        const nextSession = cookieStore.get('next-auth.session-token');
        console.log("확이닝니이닝닝니닌: "+nextSession.value);

        const answer = await selectUserId(nextSession.value);
        if(answer){
            const {title, threshold} = obj;
            emtext = getEmbedding(title, threshold);
        } else {
            const response = NextResponse.json({recommendations: "세션 변조 발생", check: 500});
            response.cookies.set('next-auth.session-token', '',{
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