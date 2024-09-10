'use client'
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode }from 'jwt-decode';

export default function SignIn() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await fetch('/api/post/login/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: id,
          password: pw
        })
      });
      const data = await response.json();
      alert(data.message);

      if(response.status === 200){
        window.location.href = '/';
      }
    }
    catch(error){
      console.log("로그인 실패:", error);
    }
  }
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const { email, name, picture, given_name, family_name, locale, sub } = decoded;

    try {
      const response = await fetch('/api/post/login/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // email: decoded.email,
          // name: decoded.name,
          // picture: decoded.picture
          email:email,
          name: name,
          picture: picture,
          givenName: given_name,
          familyName: family_name,
          locale: locale,
          googleId: sub
        })
      });

      const data = await response.json();

      if(response.status === 200){
        alert(data.message);
        window.location.href = '/';
      }else if(response.status === 201){
        sessionStorage.setItem('userEmail', email);
        window.location.href = data.message;
      }
    } catch (error) {
      console.log("구글 로그인 오류:", error);
    }
  }

  return (
    <div>
      <h4>dcmall</h4>

      {/* {!session ? ( //signIn안에 'google or credentials'로 지정해주면 문자열+Provider 방식의 로그인을 한다는 의미 문자열로 커스텀 구글을 나눈다
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
      )} */}

  <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => {
          console.log('구글 로그인 실패');
        }}
      />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email"
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPw(e.target.value)}
        />
        <button type="submit">커스텀 로그인</button>
      </form>
      

      <a href="/login/join"><button>회원가입</button></a>
      <a href="/login/findID"><button>ID 찾기</button></a>
      <a href="/login/findPW"><button>비밀번호 찾기</button></a>
    </div>
  );
}
