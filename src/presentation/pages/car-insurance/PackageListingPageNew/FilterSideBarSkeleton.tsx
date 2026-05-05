import React from 'react';

// Skeleton Loading Component for Package Filter
const FilterSideBarSkeleton = () => (
  <div className="p-3 bg-white animate-pulse">
    {/* Header skeleton */}
    <div className="mb-4">
      <div className="h-6 bg-gray-200 rounded w-32 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-24" />
    </div>

    {/* Divider */}
    <div className="h-px bg-gray-200 mb-4" />

    {/* Insurance Type skeleton */}
    <div className="mb-4">
      <div className="h-5 bg-gray-200 rounded w-28 mb-3" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>

    {/* Divider */}
    <div className="h-px bg-gray-200 mb-4" />

    {/* Insurer skeleton */}
    <div className="mb-4">
      <div className="h-5 bg-gray-200 rounded w-16 mb-3" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    </div>

    {/* Divider */}
    <div className="h-px bg-gray-200 mb-4" />

    {/* Repair Type skeleton */}
    <div className="mb-4">
      <div className="h-5 bg-gray-200 rounded w-24 mb-3" />
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>

    {/* Divider */}
    <div className="h-px bg-gray-200 mb-4" />

    {/* Sum Insured skeleton */}
    <div className="mb-4">
      <div className="h-5 bg-gray-200 rounded w-24 mb-3" />
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 rounded w-full" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-12" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>

    {/* Divider */}
    <div className="h-px bg-gray-200 mb-4" />

    {/* Price Range skeleton */}
    <div className="mb-4">
      <div className="h-5 bg-gray-200 rounded w-20 mb-3" />
      <div className="space-y-2">
        <div className="h-2 bg-gray-200 rounded w-full" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-10" />
          <div className="h-3 bg-gray-200 rounded w-10" />
        </div>
      </div>
    </div>

    {/* Divider */}
    <div className="h-px bg-gray-200 mb-4" />

    {/* Deductible skeleton */}
    <div className="mb-4">
      <div className="h-5 bg-gray-200 rounded w-20 mb-3" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>

    {/* Divider */}
    <div className="h-px bg-gray-200 mb-4" />

    {/* Action buttons skeleton */}
    <div className="flex space-x-2">
      <div className="h-8 bg-gray-200 rounded w-20" />
      <div className="h-8 bg-gray-200 rounded w-20" />
    </div>
  </div>
);

export default FilterSideBarSkeleton;
