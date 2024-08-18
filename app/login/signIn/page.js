'use client'
import React, { useState } from 'react';
import { XSS_Sanitize } from '../../util/xssSanitize';

export default function SignIn() {
  const [inputID, setInputID] = useState('');
  const [sanitizedOutputID, setSanitizedOutputID] = useState('');
  const [inputPW, setInputPW] = useState('');
  const [sanitizedOutputPW, setSanitizedOutputPW] = useState('');

  const handleSubmit = async (e) =>{
    e.preventDefault();
    try{
      const response = await fetch('/api/post/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: sanitizedOutputID,
          password: sanitizedOutputPW
        }),
      });
      const res = await response.json();
      console.log("로그인: "+res.message+" // "+res.status)

      if(res.status === 200){
        window.location.href = '/';
      }
    }catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <h4>dcmall</h4>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="ID"
          name="id"
          id="id"
          value={sanitizedOutputID}
          onChange={XSS_Sanitize(setInputID, setSanitizedOutputID)}
        />
        <input
          type="password"
          placeholder="PW"
          name="password"
          value={sanitizedOutputPW}
          onChange={XSS_Sanitize(setInputPW, setSanitizedOutputPW)}
        />
        <button type="submit">로그인</button>
      </form>

      <a href="/login/join"><button>회원가입</button></a>
      <a href="/login/findID"><button>ID 찾기</button></a>
      <a href="/login/findPW"><button>비밀번호 찾기</button></a>
    </div>
  );
}