import {NextResponse} from "next/server"
import {updateSessionByGoogleEmail, updateSessionId} from "../../../_lib/db"
import { cookies } from "next/headers";

export async function POST(req){
    const {email, provider} = await req.json();
    const cookieStore = cookies();
    const nextSession = cookieStore.get('next-auth.session-token');

    console.log("세션 등록 확인: "+email+" // "+provider+" // "+nextSession.value);

    if(provider === 'google'){
        try{
            const result = await updateSessionByGoogleEmail(email, nextSession.value);

            if(result.status === 200)
                return NextResponse.json({message: '구글 로그인 세션 등록 완료!'}, {status: 200})
            else
                return NextResponse.json({message: '구글 로그인 세션 등록 실패!'+result.message}, {status : 400});
        }catch(error){
            return NextResponse.json({message: '구글 로그인 세션 등록 실패!'+error}, {status : 400});
        }
    }else{
        try{
            const result = await updateSessionId(email, nextSession.value);

            if(result.status === 200)
                return NextResponse.json({message: '커스텀 로그인 세션 등록 완료!'}, {status: 200})
            else
                return NextResponse.json({message: '커스텀 로그인 세션 등록 실패!'+result.message}, {status:400});
        }catch(error){
            return NextResponse.json({message: '커스텀 로그인 세션 등록 실패!'+result.message}, {status:400});
        }
    }
}