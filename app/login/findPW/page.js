'use client'
import { useState } from 'react';
import { XSS_Sanitize } from '../../util/xssSanitize';

export default function FindPW() {
  const [email, setEmail] = useState('');
  const [sanitizedOutputEmail, setSanitizedOutputEmail] = useState('');
  const [id, setId] = useState('');
  const [sanitizedOutputId, setSanitizedOutputId] = useState('');
  const [email_token, setEmail_token] = useState('');
  const [sanitizedOutputemail_token, setSanitizedOutputemail_token] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 서버로 email과 id 데이터를 함께 제출
    const response = await fetch('/api/post/sendEmailServer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: sanitizedOutputEmail, 
        id: sanitizedOutputId 
      }),
    });

    alert(response.message);
   
  };

  const handler = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/post/findPwServer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token : sanitizedOutputemail_token
      }),
    });

    const result = await response.json()
     // 응답 처리 (필요시)
     if (response.status === 200) {
      // resetLink로 이동
      window.location.href = result.message;
    } else {
      alert(result.message);
    }
  }

  return (
    <div>
      <h2>비밀번호 찾기</h2>

      <form onSubmit={handleSubmit}>
        <p>E-mail</p>
        <input
          type="email"
          name="email"
          id="email"
          value={sanitizedOutputEmail}
          onChange={XSS_Sanitize(setEmail, setSanitizedOutputEmail)}
        />

        <p>ID</p>
        <input
          type="text"
          name="inputId"
          id="inputId"
          value={sanitizedOutputId}
          onChange={XSS_Sanitize(setId, setSanitizedOutputId)}
        />

        <button type="submit">Submit</button>
      </form>

      <form onSubmit={handler}>
        <p>사용자 확인</p>
        <input
            type="text"
            name="email_token"
            id="email_token"
            value={email_token}
            onChange={XSS_Sanitize(setEmail_token, setSanitizedOutputemail_token)}/>

        <button type='submit'>전송</button>
      </form>
    </div>
  );
}
