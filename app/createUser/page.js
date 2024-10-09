'use client'
import React, { useState, useEffect } from 'react';
import { XSS_Sanitize } from '../util/xssSanitize';

export default function SignIn() {
  const [inputNickname, setInputNickname] = useState('');
  const [sanitizedOutputNickname, setSanitizedOutputNickname] = useState('');
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    // 컴포넌트가 마운트된 후에 세션 저장소에서 이메일을 읽어옵니다.
    const email = sessionStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 닉네임 중복 검사
      const response = await fetch('/api/post/nickDupCheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernick: sanitizedOutputNickname
        }),
      });
      const res = await response.json();
      alert(res.message);
      
      if (response.status === 200 && res.message === "사용할 수 있는 닉네임") {
        // 닉네임 사용이 승인된 경우, 사용자 등록 요청
        const result = await fetch('/api/post/joinServer/google/userJoin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usernick: sanitizedOutputNickname,
            email: userEmail // 이메일도 함께 전송
          }),
        });
        const resultData = await result.json();
        console.log(resultData.message); // 결과를 로그로 출력

        if(result.status === 200){
            window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('구글로그인 닉네임 에러', error);
    }
  };

  return (
    <div>
      <h4>dcmall</h4>

      <form onSubmit={handleSubmit}>
        <p>닉네임: </p>
        <input
          type="nickname"
          placeholder="닉네임을 입력해주세요"
          value={sanitizedOutputNickname}
          onChange={XSS_Sanitize(setInputNickname, setSanitizedOutputNickname)}
        />
        <button type="submit">제출하기</button>
      </form>
    </div>
  );
}
