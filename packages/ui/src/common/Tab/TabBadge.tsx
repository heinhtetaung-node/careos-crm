import React from 'react';

interface BadgeProps {
  badge: number | string;
}

function TabBadge({ badge }: BadgeProps) {
  return (
    <>
      {badge && (
        <div className="inline-flex text-xs font-normal text-white rounded bg-danger ml-2 px-1 pr-1.5" data-testid="tab-badge">
          {badge}
        </div>
      )}
    </>
  );
}

export default TabBadge;
