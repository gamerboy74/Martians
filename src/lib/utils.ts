import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Improved image optimization with better caching and size handling
export function getOptimizedImageUrl(
  url: string,
  width: number,
  height: number,
  quality: number = 80
): string {
  if (!url) return url;

  // Handle Unsplash images
  if (url.includes("unsplash.com")) {
    return `${url}?w=${width}&h=${height}&q=${quality}&fit=crop&auto=format`;
  }

  // Handle other image services here if needed
  return url;
}

// Improved debounce with proper typing and cleanup
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Improved class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date with memoization, updated to IST
const dateFormatters: { [key: string]: Intl.DateTimeFormat } = {};

export function formatDate(
  date: string | Date,
  format: "short" | "long" = "long"
): string {
  const key = `${format}-IST`; // Use IST-specific key

  if (!dateFormatters[key]) {
    dateFormatters[key] = new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: format === "long" ? "long" : "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // Set to IST (UTC+5:30)
    });
  }

  return dateFormatters[key].format(new Date(date));
}

// Improved error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

// Performance monitoring utility
export const performance = {
  mark(name: string) {
    if (process.env.NODE_ENV === "development") {
      window.performance.mark(name);
    }
  },
  measure(name: string, startMark: string, endMark: string) {
    if (process.env.NODE_ENV === "development") {
      try {
        window.performance.measure(name, startMark, endMark);
        console.log(
          `Performance '${name}':`,
          window.performance.getEntriesByName(name)[0].duration.toFixed(2),
          "ms"
        );
      } catch (e) {
        console.warn("Performance measurement failed:", e);
      }
    }
  },
};

// Cache management with TTL and size limits
export const cache = {
  store: new Map<string, { data: any; expiry: number }>(),
  maxSize: 100,

  set(key: string, data: any, ttl: number = 3600000) {
    if (this.store.size >= this.maxSize) {
      const oldestKey = Array.from(this.store.entries()).sort(
        ([, a], [, b]) => a.expiry - b.expiry
      )[0][0];
      this.store.delete(oldestKey);
    }

    this.store.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  },

  get(key: string) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.data;
  },

  remove(key: string) {
    this.store.delete(key);
  },

  clear() {
    this.store.clear();
  },
};

// Intersection Observer hook with cleanup
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: "0px",
    threshold: 0,
    ...options,
  });
}

// Virtual list helper with improved performance
export function getVisibleItems<T>(
  items: T[],
  startIndex: number,
  endIndex: number,
  buffer: number = 5
): T[] {
  const start = Math.max(0, startIndex - buffer);
  const end = Math.min(items.length, endIndex + buffer);
  return items.slice(start, end);
}

// Memoization with proper cleanup and type safety
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  { maxSize = 100, ttl = 3600000 }: { maxSize?: number; ttl?: number } = {}
): T {
  const cache = new Map<string, { value: ReturnType<T>; expiry: number }>();

  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() < cached.expiry) {
      return cached.value;
    }

    if (cache.size >= maxSize) {
      const oldestKey = Array.from(cache.entries()).sort(
        ([, a], [, b]) => a.expiry - b.expiry
      )[0][0];
      cache.delete(oldestKey);
    }

    const result = fn(...args);
    cache.set(key, { value: result, expiry: Date.now() + ttl });
    return result;
  }) as T;

  return memoized;
}