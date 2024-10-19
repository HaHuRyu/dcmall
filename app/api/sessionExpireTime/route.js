// app/api/your-route/route.js 또는 pages/api/your-route.js
import { NextResponse } from 'next/server';
import { keepSession } from '../../util/createSession';
import { selectSessionExpireTimeBySession, updateSessionExpireTimeBySession } from '../../_lib/db';

export async function POST(req) {
  const { sessionId } = await req.json();
  const maxTime = await selectSessionExpireTimeBySession(sessionId);

  if (maxTime.status === 201) {
    return NextResponse.json({ message: "만료 시간을 가져올 수 없습니다." }, { status: 501 });
  }

  const now = new Date(); // 현재 UTC 시간
  const nowTime = new Date(now.getTime());
  const differenceInMilliseconds = maxTime.message - nowTime;
  const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

  if (differenceInSeconds < 3590) { // 10분 미만으로 남았을 때 갱신
    const response = await keepSession(sessionId, updateSessionExpireTimeBySession);
    console.log("서버에서 keepSession");
    return response; // 쿠키가 설정된 응답 반환
  } else {
    return NextResponse.json({ message: "세션을 재유지 불필요" }, { status: 201 });
  }
}
