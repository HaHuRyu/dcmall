'use client';
import { useEffect, useRef, useCallback } from 'react';

export function useSessionRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 세션 갱신 함수
  const refreshSession = useCallback(async () => {
    try {
      // 세션 갱신 API 호출
      const response = await fetch('/api/sessionExpireTime', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log('Session refreshed successfully:', data.sessionId);
        
      } else {
        console.error('Session refresh failed:', data.message);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }, []);

  useEffect(() => {
    // 페이지가 활성화될 때 세션을 갱신
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5분마다 세션을 갱신하도록 설정
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    }, 5 * 60 * 1000); // 5분

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshSession]);

  return null;
}
