import { NextResponse } from "next/server";
import {getEmbedding} from "../../../util/openai-utils"
import { cookies } from "next/headers";
import { selectUserId } from "../../../_lib/db";

export async function POST(req){
    const obj = await req.json();
    let emtext;

    if("threshold" in obj ){
        const cookieStore = cookies();
        const nextSession = cookieStore.get('next-session');
        let loginSession = null;

        if (nextSession != null) {
            const valueObj = JSON.parse(nextSession.value);
            loginSession = valueObj.sessionID;
        }

        const rows = await selectUserId(loginSession);
        
        if(rows.length > 0){
            const userNum = rows[0].num;
            const {title, threshold} = obj;
            emtext = getEmbedding(title, threshold, userNum);
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