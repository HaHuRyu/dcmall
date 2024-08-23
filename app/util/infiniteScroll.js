import {QueryClient, QueryClientProvider, useInfiniteQuery} from 'react-query';
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
            <h1>Search Results</h1>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {data?.pages.map((page, index) => (
                    <React.Fragment key={index}>
                        {page.results.map(item => (
                            <li key={item.title} style={{ marginBottom: '20px' }}>
                                {item.title} - 유사도: {Number(item.similarity * 100).toFixed(2)}%
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
                                {item.title}
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