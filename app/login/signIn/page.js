'use client'
import React, { useEffect } from 'react';
import{ useSession, signIn, signOut} from 'next-auth/react';

export default function SignIn() {
  const { data: session } = useSession({}); // status 추가

  useEffect(() => {
    // 비동기 작업을 처리하는 함수
    const performAsyncActions = async () => {
      try {
        if(session){
          console.log("유즈이펙트: " + JSON.stringify(session));
  
            console.log("GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG: " + JSON.stringify(session));
            
            if (session.provider === 'google') {
              await asyncGoogleSignIn(session);
            }
  
            console.log("확인: " + JSON.stringify(session));
            await asyncSessionRegist(session);
        }
      } catch (error) {
        console.error("Error in performAsyncActions: ", error);
      }
    };

    // 비동기 함수 정의
    const asyncGoogleSignIn = async (session) => {
      try {
        await googleSignIn(session);
      } catch (err) {
        console.log("asyncGoogleSignIn Error: " + err);
      }
    };

    const asyncSessionRegist = async (session) => {
      try {
        await sessionRegist(session);
      } catch (err) {
        console.log("asyncSessionRegist Error: " + err);
      }
    };

    // 비동기 함수 호출
    performAsyncActions();

  }, [session]); 

  const sessionRegist = async (session) =>{
    await fetch('/api/post/sessionRegist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session?.user?.email,
        provider: session?.provider,
      })
    })
  }

  const googleSignIn = async (session) => {
    try {
      const response = await fetch('/api/post/joinServer/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email, // 최신 세션 값을 사용합니다.
        }),
      });
  
      const data = await response.json();
  
      if (response.status === 200) {
        console.log('구글 로그인 성공');
      } else if (response.status === 201) {
        sessionStorage.setItem('userEmail', session?.user?.email || '');
        window.location.href = data.url;
      }
    } catch (error) {
      console.log("Google SignIn Error: " + error);
    }
  };
 
  const handleLogOut = async () => {
    await signOut({ redirect: false });
    sessionStorage.clear(); // 세션 스토리지를 명시적으로 클리어
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 정도 기다리기
    window.location.reload();
  };

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