"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  sessionCookie: string | null;
}

const Header: React.FC<HeaderProps> = ({ sessionCookie }) => {
  const [session, setSession] = useState<string | null>(sessionCookie);
  const [searchWord, setSearchWord] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const pathname = usePathname();

  const isLoginPage = pathname?.startsWith('/login');

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchWord(value);

    if (value.length > 0) {
      try {
        const response = await fetch('/api/post/searchRecommand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchText: value })
        });

        const data = await response.json();

        if (response.status === 200) {
          setSuggestions(data.message.map((item: any) => item.title));
        }
      } catch (err) {
        console.log("검색어 추천 오류: " + err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/post/login/signOut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCookie: session })
      });

      if (response.ok) {
        setSession(null);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
      <Link href="/"><h1>Dcmall</h1></Link>
      {!isLoginPage && (
        <form onSubmit={(e) => { e.preventDefault(); /* 검색 로직 구현 */ }} style={{ position: 'relative', flexGrow: 1, margin: '0 1rem' }}>
          <input
            type="text"
            value={searchWord}
            onChange={handleInputChange}
            placeholder="검색어를 입력하세요"
            style={{ width: '100%', padding: '0.5rem' }}
          />
          <button type="submit" style={{ position: 'absolute', right: 0, top: 0, height: '100%' }}>검색하기</button>
          {suggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              border: '1px solid #ccc',
              backgroundColor: 'white',
              zIndex: 1000
            }}>
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index}
                  onClick={() => {
                    setSearchWord(suggestion);
                    setSuggestions([]);
                  }}
                  style={{ padding: '5px 10px', cursor: 'pointer' }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </form>
      )}
      {!isLoginPage && (
        !session ? (
          <Link href="/login/signIn"><button>로그인</button></Link>
        ) : (
          <button onClick={handleSignOut}>로그아웃</button>
        )
      )}
    </header>
  );
};

export default Header;