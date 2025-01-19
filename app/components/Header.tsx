"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../Header.module.css';

interface HeaderProps {
  sessionCookie: string | null;
}

const Header: React.FC<HeaderProps> = ({ sessionCookie }) => {
  const [session, setSession] = useState<string | null>(sessionCookie);
  const [searchWord, setSearchWord] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  // 검색 폼 참조
  const formRef = useRef<HTMLFormElement>(null);
  const isLoginPage = pathname?.startsWith('/login') || false;

  // 검색어 자동완성 바깥 클릭 시 목록 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 디바운스된 서버 요청
  const debouncedFetchSuggestions = useCallback(
    debounce(async (value: string) => {
      try {
        const response = await fetch('/api/post/searchRecommand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchText: value }),
        });

        if (!response.ok) {
          console.error(`자동완성 요청 실패: 서버 응답이 ${response.status}입니다.`);
          setSuggestions([]);
          return;
        }

        const data = await response.json();
        if (data?.message && Array.isArray(data.message)) {
          const titles = data.message.map((item: any) => item.title);
          setSuggestions(titles);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('검색어 추천 오류: ', err);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // input onChange
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchWord(value);

    // 최소 2글자 이상부터 자동완성
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    debouncedFetchSuggestions(value);
  };

  // 검색 제출
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    router.push(`?search=${encodeURIComponent(searchWord)}`);
  };

  // 로그아웃
  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/post/login/signOut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCookie: session }),
      });
      if (response.ok) {
        setSession(null);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 로고 클릭
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setSearchWord('');
    router.push('/');
    router.refresh();
  };

  // 렌더링
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
                {/* 왼쪽 아이콘 */}
                <Search className={styles.searchIcon} />
                {/* 인풋 */}
                <input
                  type="text"
                  value={searchWord}
                  onChange={handleInputChange}
                  placeholder="검색어를 입력하세요 (2글자 이상)"
                  className={styles.searchInput}
                />
                {/* 오른쪽 버튼 */}
                <button
                  type="submit"
                  className={styles.searchButton}
                >
                  검색하기
                </button>
              </div>

              {/* 자동완성 목록 */}
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
