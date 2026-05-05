import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { v4 } from 'uuid';

import TableHeader from '../TableHeader';

function SkeletonRow({ rows = 5 }) {
  return (
    <div className="p-4 pt-2" data-testid="skeletonRow-container">
      <TableHeader />
      <div className="pt-5 pb-3">
        <Skeleton variant="text" width={200} />
      </div>
      {Array.from({ length: rows }, () => (
        <div
          className="grid grid-cols-8 text-center gap-1 w-full"
          key={v4()}
          data-testid="skeleton-rows"
        >
          <span className="col-span-2 bg-[#F2F3FA] h-8 flex items-center px-3 py-1 justify-start">
            <Skeleton
              variant="circle"
              width={20}
              height={20}
              className="mr-2"
            />
            <Skeleton variant="text" width={100} />
          </span>
          <span className="bg-[#F2F3FA] h-8 flex items-center px-3 py-1 justify-end">
            <Skeleton variant="text" width={100} />
          </span>
          <span className="bg-[#F2F3FA] h-8 flex items-center px-3 py-1 justify-end">
            <Skeleton variant="text" width={100} />
          </span>
          <span className="bg-[#F2F3FA] h-8 flex items-center px-3 py-1 justify-end">
            <Skeleton variant="text" width={100} />
          </span>
          <span className="bg-[#F2F3FA] h-8 flex items-center px-3 py-1 justify-end">
            <Skeleton variant="text" width={100} />
          </span>
          <span className="bg-[#F2F3FA] h-8 flex items-center px-3 py-1 justify-end">
            <Skeleton variant="text" width={100} />
          </span>
          <span className="bg-[#F2F3FA] h-8 flex items-center px-3 py-1 justify-end font-bold">
            <Skeleton variant="text" width={100} />
          </span>
        </div>
      ))}
    </div>
  );
}

export default SkeletonRow;
