import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<Element>();
  const frozen = useRef(false);
  const observerRef = useRef<IntersectionObserver>();

  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
    
    const isIntersecting = entry.isIntersecting;
    if (isIntersecting || !freezeOnceVisible) {
      setIsVisible(isIntersecting);
    }
    
    if (freezeOnceVisible && isIntersecting) {
      frozen.current = true;
      // Cleanup observer if element is frozen
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }
    }
  }, [freezeOnceVisible]);

  useEffect(() => {
    const node = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);
    
    observerRef.current = observer;
    observer.observe(node);

    return () => {
      observer.disconnect();
      observerRef.current = undefined;
    };
  }, [threshold, root, rootMargin, updateEntry]);

  return {
    ref: elementRef,
    entry,
    isVisible,
    frozen: frozen.current
  };
}