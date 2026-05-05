import { Installment } from '@alphafounders/ui';
import { Tooltip } from '@material-ui/core';
import React from 'react';

import { formatSatangToBaht } from 'utils/currency';

import { TransformedPackageType } from '../hooks/useTransformedPackages';
import { getApprovalStatus } from '../packageListing.helper';

interface PriceBreakDownPrps {
  insurancePackage: TransformedPackageType;
}
function PriceBreakDown({ insurancePackage }: PriceBreakDownPrps) {
  const { text, variant } = getApprovalStatus(
    insurancePackage.customQuoteDetail?.approvalStatus ||
      insurancePackage?.customPackageStatus
  );
  return (
    <>
      {insurancePackage.customQuoteDetail?.priceBreakDown && (
        <span data-testid="installment">
          <Installment
            firstMonthPayment={formatSatangToBaht(
              insurancePackage.customQuoteDetail.priceBreakDown.firstMonth
            )}
            installmentMonth={
              insurancePackage.customQuoteDetail.priceBreakDown.numberOfMonths -
              1
            }
            nextMonthPayment={formatSatangToBaht(
              insurancePackage.customQuoteDetail.priceBreakDown.nextMonth
            )}
            totalFee={
              insurancePackage.customQuoteDetail.priceBreakDown.feeAmount
                ? formatSatangToBaht(
                    insurancePackage.customQuoteDetail.priceBreakDown.feeAmount
                  )
                : undefined
            }
          />
        </span>
      )}
      {(insurancePackage?.customQuoteDetail?.approvalStatus ||
        insurancePackage?.customQuoteDetail?.name) && (
        <Tooltip
          title={
            <span className="text-base">
              {insurancePackage.customQuoteDetail.discountRequest
                ?.approverRemark ?? ''}
            </span>
          }
          placement="bottom"
          disableHoverListener={
            insurancePackage.customQuoteDetail?.approvalStatus !== 'REJECTED'
          }
        >
          <span className={`font-bold text-sm text-${variant}`}>{text}</span>
        </Tooltip>
      )}
    </>
  );
}

export default PriceBreakDown;
