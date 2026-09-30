import React from 'react';

interface Props {
  rows?: number;
}

export const TableSkeleton: React.FC<Props> = ({ rows = 5 }) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-4 border-t border-gray-800/50">
        <div className="h-4 bg-gray-800 rounded w-48 flex-shrink-0" />
        <div className="h-4 bg-gray-800 rounded w-64 flex-1" />
        <div className="h-4 bg-gray-800 rounded w-32 flex-shrink-0" />
        <div className="h-5 bg-gray-800 rounded-full w-20 flex-shrink-0" />
      </div>
    ))}
  </div>
);

export const EmptyState: React.FC<{ icon: string; title: string; description: string }> = ({
  icon, title, description,
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-xs">{description}</p>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <div className="text-4xl mb-3">⚠️</div>
    <p className="text-red-400 font-medium mb-1">Something went wrong</p>
    <p className="text-sm text-gray-500 mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-xs px-4 py-2">
        Try again
      </button>
    )}
  </div>
);
