import React, { useState, useEffect, useRef, memo } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { getOptimizedImageUrl } from '../lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholderSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  quality?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  onError,
  className,
  quality = 80,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  const [error, setError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '50px',
    freezeOnceVisible: true
  });

  useEffect(() => {
    if (!isVisible || !src || error) return;

    const optimizedSrc = getOptimizedImageUrl(src, width || 800, height || 600, quality);
    
    // Preload image
    const img = new Image();
    let canceled = false;

    img.onload = () => {
      if (!canceled) {
        setCurrentSrc(optimizedSrc);
        setLoaded(true);
      }
    };

    img.onerror = () => {
      if (!canceled) {
        setError(true);
        if (onError) onError({} as React.SyntheticEvent<HTMLImageElement, Event>);
      }
    };

    img.src = optimizedSrc;

    return () => {
      canceled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [isVisible, src, width, height, quality, onError, error]);

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>} 
      className="relative overflow-hidden"
      style={{ 
        width: width || 'auto',
        height: height || 'auto'
      }}
    >
      <img
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={`
          transition-opacity duration-300 ease-in-out
          ${loaded ? 'opacity-100' : 'opacity-0'}
          ${className || ''}
        `}
        onError={(e) => {
          setError(true);
          if (onError) onError(e);
        }}
        {...props}
      />
      {!loaded && !error && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ 
            aspectRatio: width && height ? `${width}/${height}` : 'auto' 
          }}
        />
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(LazyImage);