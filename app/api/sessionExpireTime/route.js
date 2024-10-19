import { NextResponse } from "next/server";
import { keepSession } from '../../util/createSession';
import {selectSessionExpireTimeBySession, updateSessionExpireTimeBySession} from '../../_lib/db'

export async function POST(req){
    const {sessionId} = await req.json();
    const maxTime = await selectSessionExpireTimeBySession(sessionId);

    if(maxTime.status === 201){
        return NextResponse.json({message: "만료 시간을 가져올 수 없습니다."}, {status: 501})
    }
    const now = new Date(); // 현재 UTC 시간
    const nowTime = new Date(now.getTime());
    // 두 시간의 차이를 밀리초 단위로 계산
    const differenceInMilliseconds = maxTime.message - nowTime;
    // 밀리초를 초로 변환
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

    if(differenceInSeconds < 3555){ //600초 10분 미만으로 남았을 때 갱신할 거임
        const response = await keepSession(sessionId, updateSessionExpireTimeBySession);
        return response; // 새 쿠키가 설정된 응답 반환
    }else{
        return NextResponse.json({message: "세션을 재유지 불필요"}, {status: 201});
    }
}