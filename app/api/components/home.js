import React from "react";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";

// 클라이언트 컴포넌트를 동적으로 로드합니다.
const ClientComponent = dynamic(() => import("./ClientComponent"), {
  ssr: false,
});

export default function Home() {
  // 서버 측에서 쿠키를 가져옵니다.
  const cookieStore = cookies();
  const nextSession = cookieStore.get('next-session');
  let loginSession = null;

  if (nextSession != null) {
    const valueObj = JSON.parse(nextSession.value);
    loginSession = valueObj.sessionID;
  }

  // 클라이언트 컴포넌트에 필요한 데이터를 전달합니다.
  return (
    <div>
      <h4>dcmall</h4>
      <ClientComponent initialSession={loginSession} />
    </div>
  );
}
