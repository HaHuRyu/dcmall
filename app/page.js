'use client'

import React, { useState } from 'react'
import sanitizeHtml from 'sanitize-html';

export default function Home() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleIdChange = (event) => {
    const unsanitizedValue = event.target.value;
    const sanitizedValue = sanitizeHtml(event.target.value, {
      allowedTags: [],
      allowedAttributes: {},
    });

    if (unsanitizedValue !== sanitizedValue) {
      console.log('XSS 공격 시도 감지:', unsanitizedValue);
    }

    setId(sanitizedValue);
  };

  const handlePasswordChange = (event) => {
    const sanitizedValue = sanitizeHtml(event.target.value, {
      allowedTags: [],
      allowedAttributes: {},
    });
    setPassword(sanitizedValue);
  };

  return (
    <div>
      <h4>dcmall</h4>

      <form action="/api/post/login" method="POST">
        <input type="text" placeholder="ID" name="id" id='id' value={id} onChange={handleIdChange}/>
        <input type="password" placeholder="PW" name="password" id='password' value={password} onChange={handlePasswordChange}/>
        <button type="submit">login</button>
      </form>

      <a href="/join"><button>회원가입</button></a>
    </div>
  );
}
