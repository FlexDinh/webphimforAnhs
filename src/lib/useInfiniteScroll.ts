import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchFunction: (page: number) => Promise<{ items: T[]; totalPages: number }>;
  initialPage?: number;
  threshold?: number; // px from bottom to trigger
  enabled?: boolean;
}

interface UseInfiniteScrollResult<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  reset: () => void;
  sentinelRef: (node: HTMLElement | null) => void;
}

export function useInfiniteScroll<T>({
  fetchFunction,
  initialPage = 1,
  threshold = 200,
  enabled = true,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const fetchInProgress = useRef(false);
  
  const loadPage = useCallback(async (pageNumber: number, isInitial: boolean = false) => {
    if (!enabled || fetchInProgress.current) return;
    
    fetchInProgress.current = true;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    
    try {
      const data = await fetchFunction(pageNumber);
      setItems(prev => isInitial ? data.items : [...prev, ...data.items]);
      setHasMore(pageNumber < data.totalPages);
      setPage(pageNumber);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
      setHasMore(false);
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
      fetchInProgress.current = false;
    }
  }, [enabled, fetchFunction]);

  useEffect(() => {
    if (enabled && items.length === 0 && !loading && !error) {
      loadPage(initialPage, true);
    }
  }, [initialPage, loadPage, enabled, items.length, loading, error]);

  const sentinelRef = useCallback((node: HTMLElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && enabled) {
        loadPage(page + 1);
      }
    }, {
      rootMargin: `0px 0px ${threshold}px 0px`
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, enabled, page, loadPage, threshold]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    loadPage(initialPage, true);
  }, [initialPage, loadPage]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return { items, loading, loadingMore, hasMore, error, page, reset, sentinelRef };
}
