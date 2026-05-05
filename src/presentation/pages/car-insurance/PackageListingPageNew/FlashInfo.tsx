import { getString } from 'presentation/theme/localization';
import React from 'react';

export default function FlashInfo() {
  return (
    <div className="flex flex-col gap-2 h-full ">
      <div className="bg-[#E9EDF5] px-6 py-4 text-left">
        <span className="text-primary font-bold">
          {getString('packageListing.flashInfo')}
        </span>
      </div>
      <div className="overflow-y-auto custom-scrollbar">
        <img
          className="w-full"
          src="/static/img/banners/banner1.jpg"
          alt="Promotion Banner 1"
        />
        <img
          className="w-full"
          src="/static/img/banners/banner2.jpg"
          alt="Promotion Banner 2"
        />
        <img
          className="w-full"
          src="/static/img/banners/banner3.jpg"
          alt="Promotion Banner 3"
        />
      </div>
    </div>
  );
}
