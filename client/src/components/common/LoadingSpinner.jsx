import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-slate-500 font-medium">{text}</p>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: rows }).map((_, rIndex) => (
        <div key={rIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, cIndex) => (
            <div key={cIndex} className="h-8 bg-slate-100 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};
