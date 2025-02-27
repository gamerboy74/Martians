import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function Loading({ size = 'md', fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinner = (
    <div className="relative">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-purple-500 ${sizeClasses[size]}`} />
      <div className={`absolute inset-0 animate-pulse rounded-full border-2 border-purple-200 ${sizeClasses[size]}`} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex justify-center py-12">
      {spinner}
    </div>
  );
}