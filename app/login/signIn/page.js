"use client";
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode }from 'jwt-decode'; // JWT 디코딩 라이브러리
import styles from './SignIn.module.css';  // CSS Module

export default function SignIn() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  // 커스텀 로그인 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/post/login/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: id,
          password: pw
        })
      });
      const data = await response.json();
      alert(data.message);

      if (response.status === 200) {
        // 세션 스토리지 등에 사용자 정보 저장
        sessionStorage.setItem('usernick', data.user);
        // 홈 화면으로 이동
        window.location.href = '/';
      }
    } catch (error) {
      console.log("로그인 실패:", error);
    }
  };

  // 구글 로그인 성공 시 호출
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      // credentialResponse.credential 안에 JWT 토큰이 들어있음
      const decoded = jwtDecode(credentialResponse.credential);

      // 필요한 정보 추출 (이름/이메일 등)
      const { email, name, picture, given_name, family_name, locale, sub } = decoded;

      // 서버로 구글 로그인 데이터 전송
      const response = await fetch('/api/post/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: name,
          picture: picture,
          givenName: given_name,
          familyName: family_name,
          locale: locale,
          googleId: sub
        })
      });

      const data = await response.json();
      if (response.status === 200) {
        alert(data.message);
        sessionStorage.setItem('usernick', data.user);
        window.location.href = '/';
      } else if (response.status === 201) {
        // 새로 가입해야 하는 구글 유저
        sessionStorage.setItem('userEmail', email);
        window.location.href = data.message; // 예: 회원가입 페이지 이동
      }
    } catch (error) {
      console.log("구글 로그인 오류:", error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.loginTitle}>DCMall 로그인</h2>
      
      <div className={styles.googleLoginArea}>
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={() => {
            console.log('구글 로그인 실패');
          }}
        />
      </div>

      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <input
          className={styles.inputField}
          type="text"
          placeholder="이메일"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          className={styles.inputField}
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button type="submit" className={styles.loginButton}>
          커스텀 로그인
        </button>
      </form>

      <div className={styles.linkArea}>
        <a href="/login/join" className={styles.linkButton}>회원가입</a>
        <a href="/login/findID" className={styles.linkButton}>ID 찾기</a>
        <a href="/login/findPW" className={styles.linkButton}>비밀번호 찾기</a>
      </div>
    </div>
  );
}
