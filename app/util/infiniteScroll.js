import {QueryClient, QueryClientProvider, useInfiniteQuery, useQueryClient} from 'react-query';
import { dehydrate } from 'react-query/hydration';
import React, { useRef, useEffect } from 'react';
import styles from '../page.module.css';

// Wrap the provider in a component
function InfScrollProvider({ children }) {
    const queryClientRef = React.useRef();

    if(!queryClientRef.current){
        queryClientRef.current = new QueryClient();
    }

    return (
        <QueryClientProvider client={queryClientRef.current}>
            {children}
        </QueryClientProvider>
    );
}

function InfScroll({ searchResults }) {
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery(
        ['searchResult', searchResults],
        ({ pageParam = 1 }) => fetchSearchResults({ pageParam }, searchResults),
        {
            getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
            enabled: !!searchResults,
        }
    );

    const loaderRef = useRef();

    useEffect(() => {
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
        <div className={styles.container}>
            <div className={styles.productGrid}>
                {data?.pages.map((page, index) => (
                    page.results?.length > 0 ? (
                        <React.Fragment key={index}>
                            {page.results.map(item => (
                                <div key={item.title} className={styles.productCard}>
                                    <div className={styles.productImageContainer}>
                                        <img 
                                            src={item.imageUrl === "no data" 
                                                ? "https://storage.googleapis.com/dcmall/noData/9482213.png" 
                                                : item.imageUrl
                                            } 
                                            alt={item.title}
                                            className={styles.productImage}
                                        />
                                    </div>
                                    <div className={styles.productInfo}>
                                        <a 
                                            href={item.perfectUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={styles.productTitle}
                                        >
                                            {item.title}
                                            {item.similarity && 
                                                <span className={styles.similarityText}>
                                                    유사도: {Number(item.similarity * 100).toFixed(2)}%
                                                </span>
                                            }
                                        </a>
                                        <p className={styles.productPrice}>{(item.cost || 0).toLocaleString()}원</p>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    ) : null
                ))}
            </div>
            <div ref={loaderRef} className={styles.loadMore} />
            {isFetchingNextPage && (
                <div className={styles.loadingText}>더 불러오는 중...</div>
            )}
        </div>
    );
}

function InfScrollNoSearch({ searchResults }) {
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
        <div className={styles.container}>
            <div className={styles.productGrid}>
                {data?.pages.map((page, index) => (
                    page.results?.length > 0 ? (
                        <React.Fragment key={index}>
                            {page.results.map(item => (
                                <div key={item.title} className={styles.productCard}>
                                    <div className={styles.productImageContainer}>
                                        <img 
                                            src={item.imageUrl === "no data" 
                                                ? "https://storage.googleapis.com/dcmall/noData/9482213.png" 
                                                : item.imageUrl
                                            } 
                                            alt={item.title}
                                            width={160} height={160}
                                            className={styles.productImage}
                                        />
                                    </div>
                                    <div className={styles.productInfo}>
                                        <a 
                                            href={item.perfectUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={styles.productTitle}
                                        >
                                            {item.title}
                                        </a>
                                        <p className={styles.productPrice}>{item.cost.toLocaleString()}원</p>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    ) : null
                ))}
            </div>
            <div ref={loaderRef} className={styles.loadMore}>
                {isFetchingNextPage && (
                    <p className={styles.loadingText}>Loading more...</p>
                )}
            </div>
        </div>
    );
}

async function fetchSearchResults({ pageParam = 1 }, searchResults) {
    const resultsPerPage = 10;
    const startIndex = (pageParam - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;

    const pageData = searchResults.slice(startIndex, endIndex);

    return {
        results: pageData,
        nextPage: endIndex < searchResults.length ? pageParam + 1 : undefined,
    };
}

async function fetchServerSideProps(jsonData) {
    const queryClient = new QueryClient();

    await queryClient.prefetchInfiniteQuery(
        'searchResult',
        ({ pageParam }) => fetchSearchResults({ pageParam }, jsonData)
    );

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
            searchText: '',
            searchResults: jsonData,
        },
    };
}

export { InfScrollProvider, InfScroll, InfScrollNoSearch, fetchSearchResults, fetchServerSideProps };

