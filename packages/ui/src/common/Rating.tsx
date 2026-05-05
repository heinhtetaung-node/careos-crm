import React from 'react';
import clsx from 'clsx';
import { StarIcon } from '@alphafounders/icons';

interface RatingProps {
  rating: number;
  className?: string;
}

function Rating({ rating, className }: RatingProps) {
  return (
    <div className={clsx(className)}>
      <div className="inline mx-1">
        <StarIcon />
      </div>
      <div className="inline mx-1">{rating?.toFixed(2)}</div>
    </div>
  );
}

export default Rating;
