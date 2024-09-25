import {QueryClient, QueryClientProvider, useInfiniteQuery, useQueryClient} from 'react-query';
import { dehydrate } from 'react-query/hydration';
import React, { useRef, useEffect } from 'react';

export function InfScrollProvider({ children }){
    const queryClientRef = React.useRef();

    if(!queryClientRef.current){
        queryClientRef.current = new QueryClient();
    }

    return(
        <QueryClientProvider client={queryClientRef.current}>
            {children}
        </QueryClientProvider>
    );
}

export function InfScroll({ searchResults }) {
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery(
        ['searchResult', searchResults], // 쿼리 키에 searchResults 추가
        ({ pageParam = 1 }) => fetchSearchResults({ pageParam }, searchResults),
        {
            getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
            enabled: !!searchResults, // searchResults가 있을 때만 쿼리 실행
        }
    );

    const loaderRef = useRef();

    useEffect(() => {
        // searchResults가 변경될 때마다 쿼리 초기화 및 재실행
        queryClient.resetQueries(['searchResult', searchResults]);
        refetch();
    }, [searchResults, queryClient, refetch]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (!data) return <div>로딩 중...</div>;

    return (
        <div className="scroll-container" style={{ minHeight: '100vh', overflowY: 'auto' }}>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {data.pages.map((page, index) => (
                    <React.Fragment key={index}>
                        {page.results.map(item => (
                            <li key={item.title} style={{ marginBottom: '20px' }}>
                                <div>
                                    {item.imageUrl === "no data" ? (
                                        <img src="https://storage.googleapis.com/dcmall/noData/9482213.png" alt="대체 이미지" width={160} height={160}/>
                                    ) : (
                                        <img src={item.imageUrl} alt={item.title} width={160} height={160}/>
                                    )}
                                </div>
                                <a href={item.perfectUrl} target="_blank" rel="noopener noreferrer">
                                    {item.title} - 유사도: {Number(item.similarity * 100).toFixed(2)}%
                                </a>
                                <p>가격: {item.cost}원</p>
                            </li>
                        ))}
                    </React.Fragment>
                ))}
            </ul>
            <div ref={loaderRef} style={{ height: '100px', background: 'transparent' }}></div>
            {isFetchingNextPage && <p>더 불러오는 중...</p>}
        </div>
    );
}

export function InfScrollNoSearch({ searchResults }) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery(
        'searchResult',
        ({ pageParam = 1 }) => fetchSearchResults({ pageParam }, searchResults),
        {
            getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
        }
    );

    const loaderRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    return (
        <div className="scroll-container" style={{ minHeight: '100vh', overflowY: 'auto' }}>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {data?.pages.map((page, index) => (
                    <React.Fragment key={index}>
                        {page.results.map(item => (
                            <li key={item.title} style={{ marginBottom: '20px' }}>
                                <div>
                                    {item.imageUrl === "no data" ? (
                                        <img src="https://storage.googleapis.com/dcmall/noData/9482213.png" alt="대체 이미지" width={160} height={160}/>
                                    ) : (
                                        <img src={item.imageUrl} alt={item.title} width={160} height={160}/>
                                    )}
                                </div>
                                <a href={item.perfectUrl} target="_blank" rel="noopener noreferrer">
                                    {item.title}
                                </a>
                                <p>가격: {item.cost}원</p>
                            </li>
                        ))}
                    </React.Fragment>
                ))}
            </ul>
            <div ref={loaderRef} style={{ height: '100px', background: 'transparent' }}></div>
            {isFetchingNextPage && <p>Loading more...</p>}
        </div>
    );
}

//데이터 조회 결과를 매개변수로 받음
// Fetch search results function
async function fetchSearchResults({ pageParam = 1 }, searchResults) {
    const resultsPerPage = 10; // Number of items per page
    const startIndex = (pageParam - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;

    const pageData = searchResults.slice(startIndex, endIndex);

    return {
        results: pageData,
        nextPage: endIndex < searchResults.length ? pageParam + 1 : undefined,
    };
}

// Server-side data fetching
export async function fetchServerSideProps(jsonData) {
    const queryClient = new QueryClient();

    await queryClient.prefetchInfiniteQuery(
        'searchResult',
        ({ pageParam }) => fetchSearchResults({ pageParam }, jsonData)
    );

    return {
        props: {
            dehydratedState: dehydrate(queryClient), // Use dehydrate to serialize the queryClient state
            searchText: '', // Assuming searchText should be passed
            searchResults: jsonData, // Pass the search results
        },
    };
}

export {fetchSearchResults};