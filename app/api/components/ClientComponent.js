"use client";
/*이렇게 이상한 구조로 잡은 것은 page에 만드려고 했는데 handleSubmit은 'use client'여야 쓸 수 있고
세션을 가져오기 위한 cookies 라이브러리는 클라이언트 컴포넌트이면 오류가 나기에 나눠야 했다.
즉, 지금 이 ClitenComponent.js는 use client를 써야만 할 수 있는 처리를 맡고 있고,
home.js는 서버 컴포넌트로서의 처리 쿠키에서 세션을 가져오는 처리를 맡고 있다.
*/
import React, { useState, useEffect } from "react";
import { InfScroll, InfScrollNoSearch, InfScrollProvider} from '../../util/infiniteScroll'
import{ useSession, signIn, signOut} from 'next-auth/react';


export default function ClientComponent({ initialSession }) {
  const [loginSession, setLoginSession] = useState(initialSession);
  const [searchWord, setSearchWord] = useState('');
  const [resultList, setResultList] = useState([]);
  const [allProductList, setAllProductList] = useState([]);
  const [renderTrigger, setRenderTrigger] = useState(false);
  const { data: session } = useSession();
 
  const fetchAllProducts = async (e) => {
    try{
      const response = await fetch('/api/post/getAllProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // 빈 객체를 전송합니다.
      });

      const data = await response.json();
      const message = data.message;

      if(response.status === 200){
        setAllProductList(message);
      }
    }catch(err){
      console.error("fetchAllProducts Error: "+err);
    }
  }

  const searchSubmit = async (e) => {
    e.preventDefault(); //아랫코드가 다 실행되고 나서 새로고침되는 것을 막는다
    try{
      const response = await fetch('/api/post/embedding', {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
          searchText: searchWord
        })
      });

      const data = await response.json();
      const recommandList = data.recommendations;
      if(response.status === 200){
        setResultList(recommandList);
      }
      
    }catch(error){
      console.log("search fetch Error: "+error);
    }
  };

  useEffect(() => {
    setLoginSession(initialSession);
    fetchAllProducts().then(() => {
      // 데이터가 성공적으로 로드된 후 상태를 업데이트하여 강제로 렌더링을 유도
      setRenderTrigger(true);
  });
  }, [initialSession]);

  useEffect(() => {
    if (resultList.length === 0) {
      fetchAllProducts().then(() => {
        // 데이터가 성공적으로 로드된 후 상태를 업데이트하여 강제로 렌더링을 유도
        setRenderTrigger(true);
    });
    }
  }, [resultList]);

  useEffect(() => {
    if(session && session.provider === 'google'){
      console.log("ㅆㅆㅆ씨ㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣ빨");
      googleSignIn(session); 
      debugger;
    }

    if(session){
      //세션 등록 드가자~
    }
  }, [session]);

  const googleSignIn = async (session) => {
    try {
      const response = await fetch('/api/post/joinServer/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email, // 최신 세션 값을 사용합니다.
        }),
      });
  
      const data = await response.json();
  
      if (response.status === 200) {
        console.log('구글 로그인 성공');
      } else if (response.status === 201) {
        sessionStorage.setItem('userEmail', session?.user?.email || '');
        window.location.href = data.url;
      }
    } catch (error) {
      console.log("Google SignIn Error: " + error);
    }
  };
 
  const handleLogOut = async () => {
    await signOut({ redirect: false });
    sessionStorage.clear(); // 세션 스토리지를 명시적으로 클리어
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 정도 기다리기
    window.location.reload();
  };

  const handleBlur = async (e) => { //자동완성 같은 기능
    e.preventDefault();
    try {
        const response = await fetch('/api/post/searchRecommand', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                searchText: searchWord
            })
        });

        // 서버 응답을 JSON으로 변환
        const data = await response.json();

        if (response.status === 200) {
        const titles = data.message.map(item => item.title);

        console.log("제목 배열: " + JSON.stringify(titles));
        } else {
            console.log("검색어 추천 실패!");
        }
    } catch (err) {
        console.log("검색어 추천 캐치: " + err);
    }
}

  return (
    <div>
      {!session ? ( //signIn안에 'google or credentials'로 지정해주면 문자열+Provider 방식의 로그인을 한다는 의미 문자열로 커스텀 구글을 나눈다
        <>
          <button onClick={() => signIn('google', {redirect: false})}>구글 로그인</button>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            const result = await signIn('credentials', { redirect: false, email, password }); //Credentials(커스텀 로그인)에 로그인을 요청 리다이렉트 금지, email, password를 authorize에 보낸다.
            if (result?.error) {
              console.log("커스텀 로그인 실패:", result.error);
            }
          }}>
            <input name="email" type="text" placeholder="Email" />
            <input name="password" type="password" placeholder="Password" />
            <button type="submit">커스텀 로그인</button>
          </form>
        </>
      ) : (
        <button onClick={() => handleLogOut()}>로그아웃</button>
      )}
      
      {session ? (
        <div>
          <p>Name: {session.user.name}</p>
          <p>Email: {session.user.email}</p>
        </div>
      ) : (
        <p>Please sign in to see your profile</p>
      )}

      <form onSubmit={searchSubmit}>
        <input 
        type="text"
        value={searchWord}
        onBlur={handleBlur}
        onChange={(e) => setSearchWord(e.target.value)}/>
        <button type="submit">검색하기</button>
      </form>

      {/* {resultList.length > 0 ? (
        <ul>
          {resultList.map((result, index) => (
            <li key={index}>
              {result.title}: {Number(result.similarity * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      ) : (
        <p>검색 결과가 없습니다.</p>
      )} */}
      {renderTrigger && (
            resultList.length > 0 ? (
                <InfScrollProvider>
                    <InfScroll searchResults={resultList} />
                </InfScrollProvider>
            ) : (
                <InfScrollProvider>
                    <InfScrollNoSearch searchResults={allProductList} />
                </InfScrollProvider>
            )
        )}

    </div>
  );
}
//toFixed(2)는 소수점 아래를 2자리로 하는 것