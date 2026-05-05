import React from 'react';

import { getString } from 'presentation/theme/localization';

function TableHeader() {
  return (
    <div className="grid grid-cols-8 text-center gap-1 h-[50px]">
      <span className="col-span-2 flex items-center justify-center bg-primary text-white rounded-tl-lg">
        {getString('discountPricing.pricingHeader.plans')}
      </span>
      <span className="flex items-center justify-center bg-primary text-white">
        {getString('discountPricing.pricingHeader.firstMonth')}
      </span>
      <span className="flex items-center justify-center bg-primary text-white">
        {getString('discountPricing.pricingHeader.subsequentMonth')}
      </span>
      <span className="flex items-center justify-center bg-primary text-white">
        {getString('discountPricing.pricingHeader.totalFee')}
      </span>
      <span className="flex items-center justify-center bg-primary text-white">
        {getString('discountPricing.pricingHeader.totalDiscount')}
      </span>
      <span className="flex items-center justify-center bg-primary text-white">
        {getString('discountPricing.pricingHeader.percentTotalDiscount')}
      </span>
      <span className="flex items-center justify-center bg-primary text-white rounded-tr-lg">
        {getString('discountPricing.pricingHeader.subTotalPayment')}
      </span>
    </div>
  );
}

export default TableHeader;
