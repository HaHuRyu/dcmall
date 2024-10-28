'use client'
import { useEffect } from 'react';
import { useSessionRefresh } from '../../sessionRefresh';

export default function SessionRefreshWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  useSessionRefresh();

  // For testing purposes
  useEffect(() => {
    console.log('SessionRefreshWrapper mounted');
    return () => {
      console.log('SessionRefreshWrapper unmounted');
    };
  }, []);

  return <>{children}</>;
}