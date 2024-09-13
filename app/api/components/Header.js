"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header({ session }) {
  const [searchWord, setSearchWord] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/?search=${encodeURIComponent(searchWord)}`);
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    try{
      const response = await fetch('/api/post/login/signOut', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionCookie: session
        })
      });
  
      const data = await response.json();
      const message = data.message;
      
      alert(message);
      window.location.reload();
    }catch(err){
      console.log("로그아웃 오류: "+err);
    }
  }

  return (
    <header>
      <Link href="/"><h1>Dcmall</h1></Link>
      <form onSubmit={handleSearch}>
        <input 
          type="text"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          placeholder="검색어를 입력하세요"
        />
        <button type="submit">검색</button>
      </form>
      {!session ? (
        <Link href="/login/signIn"><button>로그인</button></Link>
      ) : (
        <>
          <button onClick={handleSignOut}>로그아웃</button>
          <Link href="/mypage"><button>마이페이지</button></Link>
        </>
      )}
    </header>
  );
}