"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { InfScroll, InfScrollNoSearch, InfScrollProvider} from './util/infiniteScroll'


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