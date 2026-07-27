import { useEffect } from 'react';

export function useImagePreloader(urls: string[], options?: { priority?: boolean; maxConcurrent?: number }): void {
  const maxConcurrent = options?.maxConcurrent || 3;
  
  useEffect(() => {
    if (typeof window === 'undefined' || !urls || urls.length === 0) return;
    
    let isCancelled = false;
    let currentIndex = 0;
    let activeCount = 0;
    
    const loadNext = () => {
      if (isCancelled || currentIndex >= urls.length) return;
      
      while (activeCount < maxConcurrent && currentIndex < urls.length) {
        const url = urls[currentIndex++];
        if (!url) continue;
        
        activeCount++;
        const img = new Image();
        
        const onLoadOrError = () => {
          activeCount--;
          loadNext();
        };
        
        img.onload = onLoadOrError;
        img.onerror = onLoadOrError;
        
        if (options?.priority) {
          // @ts-ignore
          img.fetchPriority = "high";
        }
        
        img.src = url;
      }
    };
    
    loadNext();
    
    return () => {
      isCancelled = true;
    };
  }, [urls, maxConcurrent, options?.priority]);
}
