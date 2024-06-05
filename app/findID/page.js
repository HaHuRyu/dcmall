'use client'
import { useState } from 'react';
import { XSS_Sanitize } from '../util/xssSanitize';

export default function Join() {
  const [email, setEmail] = useState('');
  const [sanitizedOutputEmail, setSanitizedOutputEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/post/findIDServer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: sanitizedOutputEmail }),
    });

    const data = await response.json();
    alert(data.message);
  };

  return (
    <div>
      <h2>ID찾기</h2>

      <form onSubmit={handleSubmit}>
        <p>E-mail</p>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={XSS_Sanitize(setEmail, setSanitizedOutputEmail)}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
