import React from 'react';
import { useVirtualization } from '../hooks/useVirtualization';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
}: VirtualListProps<T>) {
  const {
    visibleRange,
    totalHeight,
    offsetY,
    onScroll,
  } = useVirtualization({
    itemCount: items.length,
    itemHeight,
    containerHeight,
  });

  const visibleItems = items.slice(visibleRange.start, visibleRange.end + 1);

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) =>
            renderItem(item, index + visibleRange.start)
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(VirtualList);