"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../Header.module.css'
//import { Search, Menu, X } from 'lucide-react';

interface HeaderProps {
  sessionCookie: string | null;
}

const Header: React.FC<HeaderProps> = ({ sessionCookie }) => {
  const [session, setSession] = useState<string | null>(sessionCookie);
  const [searchWord, setSearchWord] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  // //25-01-11 추가된 css 부분
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [searchQuery, setSearchQuery] = useState('');

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (searchQuery.trim()) {
  //     router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  //   }
  // };

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

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // 기본 동작 방지
    setSearchWord('');
    router.push('/'); // 루트 경로로 이동
    router.refresh(); // 페이지 새로고침
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link 
            href="/" 
            onClick={handleLogoClick}
            className={styles.logo}
          >
            Dcmall
          </Link>
          
          {!isLoginPage && (
            <form 
              ref={formRef}
              onSubmit={handleSearchSubmit}
              className={styles.searchForm}
            >
              <div className={styles.searchInputWrapper}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  value={searchWord}
                  onChange={handleInputChange}
                  placeholder="검색어를 입력하세요"
                  className={styles.searchInput}
                />
                <button 
                  type="submit"
                  className={styles.searchButton}
                >
                  검색하기
                </button>
              </div>
              
              {suggestions.length > 0 && (
                <ul className={styles.suggestions}>
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setSearchWord(suggestion);
                        setSuggestions([]);
                      }}
                      className={styles.suggestionItem}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </form>
          )}

          {!isLoginPage && (
            <div className={styles.authButtons}>
              {!session ? (
                <Link 
                  href="/login/signIn"
                  className={styles.authButton}
                >
                  로그인
                </Link>
              ) : (
                <>
                  <button 
                    onClick={handleSignOut}
                    className={styles.authButton}
                  >
                    로그아웃
                  </button>
                  <Link 
                    href="/mypage"
                    className={styles.authButton}
                  >
                    마이페이지
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
