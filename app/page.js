"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { InfScroll, InfScrollNoSearch, InfScrollProvider} from './util/infiniteScroll'

/*
24-11-24
getAllProduct를 저런 식으로 구성하면 redis거를 먼저 뿌리고, mysql것을 뿌릴 줄 알았으나,
실상은 mysql이 덮어씌워지는 형태였다.
*/
export default function Page() {
  const [resultList, setResultList] = useState([]);
  const [renderTrigger, setRenderTrigger] = useState(false);
  const [allProductList, setAllProductList] = useState([]);
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
        } catch (error) {
          console.error("Search fetch error: ", error);
        }
      };

      fetchSearchResults();
    }
  }, [searchWord]);

  const fetchAllProducts = async () => {
    try {
        const productSet = new Set(); // 중복 방지를 위한 Set 생성

        // Redis 데이터 가져오기
        const redisResponse = await fetch('/api/post/getAllProduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        if (redisResponse.ok) {
          const redisData = await redisResponse.json();
          const redisMessage = redisData.message;

          if (redisMessage) { //이제 링킹해야 함;;
              // 객체를 배열로 변환하여 JSON 파싱 후 Set에 추가
              const parsedRedisMessage = Object.values(redisMessage).map((item) => JSON.parse(item));
              parsedRedisMessage.forEach((item) => productSet.add(JSON.stringify(item)))

              // Set을 배열로 변환하면서 JSON.parse로 다시 객체로 변환
              const uniqueProducts = Array.from(productSet).map((item) => JSON.parse(item));

              setAllProductList(uniqueProducts); // 중복 제거된 데이터로 상태 업데이트
          }
        }

        // MySQL 데이터 가져오기
        const mysqlResponse = await fetch('/api/post/getAllProduct', {
            method: 'GET',
        });

        if (mysqlResponse.ok) {
            const mysqlData = await mysqlResponse.json();
            const mysqlMessage = mysqlData.message;
            if (mysqlMessage?.length > 0) {
                mysqlMessage.forEach((item) => productSet.add(JSON.stringify(item))); // JSON.stringify로 중복 확인
                // Set을 배열로 변환하면서 JSON.parse로 다시 객체로 변환
                const uniqueProducts = Array.from(productSet).map((item) => JSON.parse(item));

                setAllProductList(uniqueProducts); // 중복 제거된 데이터로 상태 업데이트
            }
        }
    } catch (error) {
        console.error("fetchAllProducts Error: " + error);
    }
  };

  useEffect(() => {
    if (resultList === null || resultList.length === 0) {
      fetchAllProducts().then(() => {

        setRenderTrigger(true);
    });
    }
  }, [resultList]);

  return (
    <div>
      <h1>Welcome to Dcmall</h1>
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