'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/hello')
      .then(response => response.text())
      .then(data => setMessage(data));
  }, []);

  const sendData = async () => {
    const response = await fetch('http://localhost:8080/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: '가자' }),
    });
    const result = await response.text();
    console.log(result);
  };

  return (
    <div>
      <h1>{message}</h1>
      <button onClick={sendData}>Send Data</button>
    </div>
  );
}
