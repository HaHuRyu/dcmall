"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
  sessionCookie: string | null;
}

const Header: React.FC<HeaderProps> = ({ sessionCookie }) => {
  const [session, setSession] = useState<string | null>(sessionCookie);
  const [searchWord, setSearchWord] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname?.startsWith('/login') || false;

  // 검색 폼을 참조하기 위한 useRef 생성
  const formRef = useRef<HTMLFormElement>(null);

  // 컴포넌트가 마운트될 때 클릭 이벤트 리스너 추가
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 제출 시 추천 목록 초기화
    setSuggestions([]);
    router.push(`?search=${encodeURIComponent(searchWord)}`);
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
    <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Link href="/">
          <h1>Dcmall</h1>
        </Link>
        {!isLoginPage && (
          // formRef를 폼 요소에 추가
          <form ref={formRef} onSubmit={handleSearchSubmit} style={{ position: 'relative', flexGrow: 1, margin: '0 1rem' }}>
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
            <div>
              <button onClick={handleSignOut}>로그아웃</button>
              <a href="/mypage"><button>마이페이지</button></a>
            </div>
          )
        )}
      </div>
    </header>
  );
};

export default Header;
