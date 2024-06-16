'use client';
import { useState } from 'react';

export default function Page() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [similarity, setSimilarity] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const res = await fetch('/api/similarity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ textA: text1, textB: text2 }),
    });

    if (!res.ok) {
      console.error('Error:', res.statusText);
      return;
    }

    try {
      const data = await res.json();
      if (res.status === 200) {
        setSimilarity(data.sim);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

  return (
    <div>
      <h1>Text Similarity Calculator</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Text 1:</label>
          <input
            type="text"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
          />
        </div>
        <div>
          <label>Text 2:</label>
          <input
            type="text"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
          />
        </div>
        <button type="submit">Calculate Similarity</button>
      </form>
      {similarity !== null && (
        <div>
          <h2>Similarity: {similarity}%</h2>
        </div>
      )}
    </div>
  );
}
