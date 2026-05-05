import React from 'react';

const packageTypeStyles: Record<string, string> = {
  premium: 'bg-amber-100 text-amber-800',
  basic: 'bg-slate-200 text-slate-700',
  recommended: 'bg-green-100 text-green-800',
};

interface PackageTypeBadgeProps {
  label?: string | null;
}

function PackageTypeBadge({ label }: Readonly<PackageTypeBadgeProps>) {
  if (!label) return null;

  const style =
    packageTypeStyles[label.toLowerCase()] ?? packageTypeStyles.basic;

  return (
    <span
      className={`ml-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}

export default PackageTypeBadge;
