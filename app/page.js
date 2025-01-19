"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { InfScroll, InfScrollNoSearch, InfScrollProvider } from './util/infiniteScroll'
import  styles  from './page.module.css'

export default function Page() {
    const [resultList, setResultList] = useState([])
    const [renderTrigger, setRenderTrigger] = useState(false)
    const [allProductList, setAllProductList] = useState([])
    const searchParams = useSearchParams()
    const searchWord = searchParams.get('search')

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
            const productSet = new Set();

            const redisResponse = await fetch('/api/post/getAllProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            if (redisResponse.ok) {
                const redisData = await redisResponse.json();
                const redisMessage = redisData.message;

                if (redisMessage) {
                    const parsedRedisMessage = Object.values(redisMessage).map((item) => JSON.parse(item));
                    parsedRedisMessage.forEach((item) => productSet.add(JSON.stringify(item)))

                    const uniqueProducts = Array.from(productSet).map((item) => JSON.parse(item));
                    setAllProductList(uniqueProducts);
                }
            }

            const mysqlResponse = await fetch('/api/post/getAllProduct', {
                method: 'GET',
            });

            if (mysqlResponse.ok) {
                const mysqlData = await mysqlResponse.json();
                const mysqlMessage = mysqlData.message;
                if (mysqlMessage?.length > 0) {
                    mysqlMessage.forEach((item) => productSet.add(JSON.stringify(item)));
                    const uniqueProducts = Array.from(productSet).map((item) => JSON.parse(item));
                    setAllProductList(uniqueProducts);
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
        <div className={styles.container}>
            <main className={styles.main}>
                <h1 className={styles.title}>Welcome to Dcmall</h1>
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
            </main>
        </div>
    );
}

