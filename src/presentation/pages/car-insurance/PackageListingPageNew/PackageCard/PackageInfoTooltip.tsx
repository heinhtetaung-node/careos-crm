import React from 'react';

import { Divider } from '@alphafounders/ui';

import { getString } from 'presentation/theme/localization';

interface PackageInfoTooltipProps {
  name: string;
  expiryDate: string;
  termsAndConditions: string;
}

function PackageInfoTooltip({
  name,
  expiryDate,
  termsAndConditions,
}: PackageInfoTooltipProps) {
  return (
    <div className="p-3 bg-white text-black text-base rounded-xl font-normal shadow-lg">
      <div className="w-[480px] h-[392px] overflow-y-scroll pr-3 tooltip-scrollbar">
        <p className="my-2 font-bold">
          {getString('leadDetailFields.packageName')}
        </p>
        <p className="my-1">{name}</p>
        <Divider pattern="dash" />
        <p className="my-2 font-bold">{getString('text.expiryDate')}</p>
        <p className="my-1">{expiryDate}</p>
        <Divider pattern="dash" />
        <p className="my-2 font-bold">{getString('text.termsAndConditions')}</p>
        {termsAndConditions
          ?.split('\n')
          .map((term: string) => <p className="my-1 leading-5">{term}</p>)}
      </div>
    </div>
  );
}

export default PackageInfoTooltip;
