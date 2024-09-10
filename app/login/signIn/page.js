'use client'
import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

export default function SignIn() {
  const [sessionSynced, setSessionSynced] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const syncSession = async () => {
      if (session && status === "authenticated" && !sessionSynced) {
        try {
          const response = await fetch('/api/post/syncSession', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session.user.email,
              provider: session.provider,
              sessionId: session.user.id
            }),
          });
          if (response.ok) {
            setSessionSynced(true);
          } else {
            console.error('세션 동기화 실패:', await response.text());
          }
        } catch (error) {
          console.error('세션 동기화 오류:', error);
        }
      }
    };
  
    syncSession();
  }, [session, status, sessionSynced]);

  return (
    <div>
      <h4>dcmall</h4>

      {!session ? ( //signIn안에 'google or credentials'로 지정해주면 문자열+Provider 방식의 로그인을 한다는 의미 문자열로 커스텀 구글을 나눈다
        <>
          <button onClick={() => signIn('google', {redirect: false})}>구글 로그인</button>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            const result = await signIn('credentials', { redirect: false, email, password }); //Credentials(커스텀 로그인)에 로그인을 요청 리다이렉트 금지, email, password를 authorize에 보낸다.
            if (result?.error) {
              console.log("커스텀 로그인 실패:", result.error);
            }
          }}>
            <input name="email" type="text" placeholder="Email" />
            <input name="password" type="password" placeholder="Password" />
            <button type="submit">커스텀 로그인</button>
          </form>
        </>
      ) : (
        <button onClick={() => handleLogOut()}>로그아웃</button>
      )}
      
      {session ? (
        <div>
          <p>Name: {session.user.name}</p>
          <p>Email: {session.user.email}</p>
        </div>
      ) : (
        <p>Please sign in to see your profile</p>
      )}

      <a href="/login/join"><button>회원가입</button></a>
      <a href="/login/findID"><button>ID 찾기</button></a>
      <a href="/login/findPW"><button>비밀번호 찾기</button></a>
    </div>
  );
}