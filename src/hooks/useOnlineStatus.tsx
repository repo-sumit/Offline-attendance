import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => storage.getOnlineMode());

  useEffect(() => {
    // Listen for storage changes from other components
    const handleStorageChange = () => {
      setIsOnline(storage.getOnlineMode());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-window updates
    const handleModeChange = (e: CustomEvent) => {
      setIsOnline(e.detail.isOnline);
    };
    
    window.addEventListener('onlineModeChange' as any, handleModeChange as any);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('onlineModeChange' as any, handleModeChange as any);
    };
  }, []);

  return isOnline;
}
