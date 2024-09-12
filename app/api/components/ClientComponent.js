"use client";
/*이렇게 이상한 구조로 잡은 것은 page에 만드려고 했는데 handleSubmit은 'use client'여야 쓸 수 있고
세션을 가져오기 위한 cookies 라이브러리는 클라이언트 컴포넌트이면 오류가 나기에 나눠야 했다.
즉, 지금 이 ClitenComponent.js는 use client를 써야만 할 수 있는 처리를 맡고 있고,
home.js는 서버 컴포넌트로서의 처리 쿠키에서 세션을 가져오는 처리를 맡고 있다.
*/
import React, { useState, useEffect } from "react";
import { InfScroll, InfScrollNoSearch, InfScrollProvider} from '../../util/infiniteScroll'

export default function ClientComponent({ sessionCookie }) {
  const [searchWord, setSearchWord] = useState('');
  const [resultList, setResultList] = useState([]);
  const [allProductList, setAllProductList] = useState([]);
  const [renderTrigger, setRenderTrigger] = useState(false);
  const [session, setSession] = useState(sessionCookie);
  const [suggestions, setSuggestions] = useState([]);


  useEffect(() => {
    setSession(sessionCookie);
  }, [sessionCookie]);

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
        try{
          const response = await fetch('/api/post/searchResLinking', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              searchText: recommandList
            })
          });

          const data = await response.json();
          if(response.status === 200){
            setResultList(data.message);
          }
        }catch(err){
          console.log("searchResLinking Error: "+err);
        }
      }else{
        alert("오류");
      }
      
    }catch(error){
      console.log("search fetch Error: "+error);
    }
  };

  useEffect(() => {
    if (resultList === null || resultList.length === 0) {
      fetchAllProducts().then(() => {

        setRenderTrigger(true);
    });
    }
  }, [resultList]);

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

const handleInputChange = async (e) => {
  const value = e.target.value;
  setSearchWord(value);

  if (value.length > 0) {
    try {
      const response = await fetch('/api/post/searchRecommand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchText: value
        })
      });

      const data = await response.json();

      if (response.status === 200) {
        setSuggestions(data.message.map(item => item.title));
      }
    } catch (err) {
      console.log("검색어 추천 오류: " + err);
    }
  } else {
    setSuggestions([]);
  }
};

  return (
    <div>
      <a href="/"><p>Dcmall</p></a>
      {!session ? (
        <a href="/login/signIn"><button>로그인</button></a>
      ) : (
        <button onClick={handleSignOut}>로그아웃</button>
      )}

<form onSubmit={searchSubmit}>
        <div style={{ position: 'relative' }}>
          <input 
            type="text"
            value={searchWord}
            onChange={handleInputChange}
            onBlur={() => setTimeout(() => setSuggestions([]), 200)}
          />
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
              backgroundColor: 'white'
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
        </div>
        <button type="submit">검색하기</button>
      </form>
      
      {renderTrigger && (
            resultList === null || resultList.length > 0 ? (
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