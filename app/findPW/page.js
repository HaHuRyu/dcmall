'use client'
import { useState } from 'react';
import { XSS_Sanitize } from '../util/xssSanitize';

export default function Join() {
  const [email, setEmail] = useState('');
  const [sanitizedOutputEmail, setSanitizedOutputEmail] = useState('');
  const [id, setId] = useState('');
  const [sanitizedOutputId, setSanitizedOutputId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 서버로 email과 id 데이터를 함께 제출
    const response = await fetch('/api/post/findPwServer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: sanitizedOutputEmail, 
        id: sanitizedOutputId 
      }),
    });

    const result = await response.json();

    // 응답 처리 (필요시)
    console.log('Result:', result);
  };

  return (
    <div>
      <h2>ID 찾기</h2>

      <form onSubmit={handleSubmit}>
        <p>E-mail</p>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={XSS_Sanitize(setEmail, setSanitizedOutputEmail)}
        />

        <p>ID</p>
        <input
          type="text"
          name="inputId"
          id="inputId"
          value={id}
          onChange={XSS_Sanitize(setId, setSanitizedOutputId)}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
