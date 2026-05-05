import clsx from 'clsx';
import React from 'react';

interface PackageInfoSectionProps extends React.PropsWithChildren {
  title: string;
  titleProps?: {
    className?: string;
  };
  childProps?: {
    className?: string;
  };
}

function PackageInfoSection({
  title,
  children,
  titleProps = {},
  childProps = {},
}: PackageInfoSectionProps) {
  return (
    <>
      <p className={clsx('text-gray-400 my-2', titleProps.className)}>
        {title}
      </p>
      <p className={clsx('text-lg font-semibold my-2', childProps.className)}>
        {children}
      </p>
    </>
  );
}

export default PackageInfoSection;
