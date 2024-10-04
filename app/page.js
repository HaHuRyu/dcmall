"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const [resultList, setResultList] = useState([]);
  const searchParams = useSearchParams();
  const searchWord = searchParams.get('search');

  useEffect(() => {
    if (searchWord) {
      const fetchSearchResults = async () => {
        try {
          const response = await fetch('/api/post/embedding', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchText: searchWord })
          });

          const data = await response.json();

          if (response.ok) {
            setResultList(data.recommendations);
          } else {
            console.error("Error fetching recommendations: ", data);
          }
        } catch (error) {
          console.error("Search fetch error: ", error);
        }
      };

      fetchSearchResults();
    }
  }, [searchWord]);

  return (
    <div>
      <h1>Welcome to Dcmall</h1>
      {resultList.length > 0 ? (
        <ul>
          {resultList.map((result, index) => (
            <li key={index}>
              {result.title}: {Number(result.similarity * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      ) : (
        <p>검색 결과가 없습니다.</p>
      )}
    </div>
  );
}