import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from '../lib/utils';

interface UseVirtualizationProps {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  scrollThreshold?: number;
}

interface ScrollMetrics {
  scrollTop: number;
  viewportHeight: number;
  totalHeight: number;
}

export function useVirtualization({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
  scrollThreshold = 250
}: UseVirtualizationProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    scrollTop: 0,
    viewportHeight: containerHeight,
    totalHeight: itemCount * itemHeight
  });

  const lastScrollTop = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');

  const getVisibleRange = useCallback(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, itemCount]);

  const [visibleRange, setVisibleRange] = useState(getVisibleRange());

  // Debounced scroll handler for better performance
  const handleScroll = useCallback(
    debounce((event: React.UIEvent<HTMLElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      
      // Determine scroll direction
      scrollDirection.current = newScrollTop > lastScrollTop.current ? 'down' : 'up';
      lastScrollTop.current = newScrollTop;

      // Only update if scroll difference is significant
      if (Math.abs(newScrollTop - scrollTop) > scrollThreshold) {
        setScrollTop(newScrollTop);
        setMetrics({
          scrollTop: newScrollTop,
          viewportHeight: containerHeight,
          totalHeight: itemCount * itemHeight
        });
      }
    }, 16), // ~60fps
    [scrollTop, containerHeight, itemCount, itemHeight, scrollThreshold]
  );

  // Update visible range when scroll position changes
  useEffect(() => {
    setVisibleRange(getVisibleRange());
  }, [metrics, getVisibleRange]);

  // Calculate styles for the container and content
  const containerStyle = {
    height: containerHeight,
    overflowY: 'auto' as const
  };

  const contentStyle = {
    height: itemCount * itemHeight,
    position: 'relative' as const
  };

  const getItemStyle = (index: number) => ({
    position: 'absolute' as const,
    top: index * itemHeight,
    left: 0,
    width: '100%',
    height: itemHeight
  });

  return {
    visibleRange,
    scrollDirection: scrollDirection.current,
    metrics,
    containerStyle,
    contentStyle,
    getItemStyle,
    handleScroll
  };
}