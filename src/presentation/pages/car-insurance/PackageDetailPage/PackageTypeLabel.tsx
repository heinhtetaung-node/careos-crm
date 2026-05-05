import React from 'react';

export default function PackageTypeLabel({
  label,
}: Readonly<{ label: string }>) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700 ml-2">
      {label}
    </span>
  );
}
