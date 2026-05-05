import {
  Button,
  Container,
  Rating,
  Badge,
  isElementInViewport,
  Price,
} from '@alphafounders/ui';
import { CheckCircleIcon } from '@alphafounders/icons';
import { CircularProgress } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';

import { getString } from 'presentation/theme/localization';
import { satangToBaht } from 'utils/currency';
import { formatCoverage } from 'presentation/components/QcDetailPage/helpers/utils';

interface InsurerHeaderProps {
  insurancePackage: any;
  isSelected: boolean;
  isSelectedForComparison: boolean;
  isSelectLoading: boolean;
  showButtons: boolean;
  onSelect: () => void;
  onCompare: () => void;
  isDisabled?: boolean;
}

function InsurerHeader({
  insurancePackage,
  isSelected,
  isSelectedForComparison,
  isSelectLoading,
  showButtons,
  onSelect,
  onCompare,
  isDisabled = false,
}: InsurerHeaderProps) {
  const header = useRef<HTMLDivElement>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const handleScroll = () => {
    if (isElementInViewport(header)) {
      setShowStickyHeader(false);
    } else {
      setShowStickyHeader(true);
    }
  };
  const handleSelect = () => {
    if (!isSelected) {
      onSelect();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const selectText = isSelected
    ? getString('packageListing.selected')
    : getString('text.select');

  return (
    <div>
      {showStickyHeader && (
        <div
          className="fixed top-[64px] left-0 right-0 p-3 w-full bg-white z-10"
          data-testid="sticky-header"
        >
          <Container className="w-[900px] text-left flex justify-between">
            <div className="flex gap-2">
              <img src={insurancePackage.logo} alt="logo" />
              <div>
                <div className="text-primary font-bold text-extra-lg">
                  {insurancePackage.title}
                </div>
                <div>
                  <Rating rating={insurancePackage.rating} className="inline" />
                  <span className="inline text-success">
                    {insurancePackage.subtitle}
                  </span>
                </div>
              </div>
            </div>
            {showButtons ? (
              <div>
                <Button
                  text={
                    isSelectLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : (
                      selectText
                    )
                  }
                  onClick={handleSelect}
                  disabled={isDisabled}
                  variant="primary"
                  className="p-2 m-1 w-[130px] h-[35px] text-base inline-flex align-middle"
                  icon={
                    isSelected && !isSelectLoading ? (
                      <CheckCircleIcon className="w-[13px] h-[13px] bg-success rounded-full p-1 mr-2" />
                    ) : undefined
                  }
                  dataTestId="select-button"
                />
              </div>
            ) : null}
          </Container>
        </div>
      )}
      <div ref={header} data-testid="normal-header">
        <Badge variant="warning">
          <div className="w-[415px] text-center">
            <img className="w-logo-m" src={insurancePackage.logo} alt="logo" />
            <p className="text-extra-lg text-primary font-bold my-1">
              {insurancePackage.title}
            </p>
            <Rating rating={insurancePackage.rating} className="inline" />
            <div>
              <Price
                className={'font-bold'}
                variant="normal"
                value={`${formatCoverage(
                  satangToBaht(insurancePackage?.premium?.units)
                )} ${getString('healthPackage.thb')}`}
              />
            </div>
            <div className="col-span-12 flex flex-wrap mb-2">
              {insurancePackage.features.map((feature: any, index: number) => (
                <span
                  key={index}
                  className="w-auto p-1 px-2 mr-2 mt-2 rounded-lg bg-slate-100 text-slate-400"
                >
                  {feature?.displayName}
                </span>
              ))}
            </div>
          </div>
        </Badge>
        {showButtons ? (
          <>
            <Button
              text={
                isSelectLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : (
                  selectText
                )
              }
              onClick={handleSelect}
              disabled={isDisabled}
              variant="primary"
              className="p-2 m-3 w-[143px] h-[35px] text-base inline-flex align-middle"
              icon={
                isSelected && !isSelectLoading ? (
                  <CheckCircleIcon className="w-[13px] h-[13px] bg-success rounded-full p-1 mr-2" />
                ) : undefined
              }
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default InsurerHeader;
