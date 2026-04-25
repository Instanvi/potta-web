'use client';
import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = true,
}) => {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${height} ${width} ${
        rounded ? 'rounded' : ''
      } ${className}`}
    />
  );
};

// Specific skeleton components for different use cases
export const SkeletonText: React.FC<{ className?: string; lines?: number }> = ({
  className = '',
  lines = 1,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          height="h-4"
          width="w-full"
          className={index === lines - 1 ? 'w-3/4' : ''}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}
    >
      <div className="space-y-4">
        <SkeletonLoader height="h-6" width="w-1/2" />
        <SkeletonLoader height="h-4" width="w-full" />
        <SkeletonLoader height="h-4" width="w-3/4" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <SkeletonLoader
              key={colIndex}
              height="h-4"
              width="w-full"
              className={colIndex === 0 ? 'w-1/3' : ''}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonChart: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}
    >
      <div className="space-y-4">
        <SkeletonLoader height="h-6" width="w-1/3" />
        <div className="h-64 bg-gray-100 rounded animate-pulse flex items-end justify-between px-4 pb-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-300 rounded-t"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                width: '8%',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
