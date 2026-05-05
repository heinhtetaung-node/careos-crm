import React, { memo, useCallback } from 'react';
import clsx from 'clsx';
import { ChevronLeftOutlined } from '@material-ui/icons';
import MinMaxNumber from '../../../../components/MinMaxNumber';
import { INSURER_LOGO_BASE_URL } from 'config/constant';
import type {
  AggregationInsurerItem,
  PremiumDetailResponse,
  SearchPremiumItem,
} from '../../model/insurancePackageApi.types';
import PremiumRow from './PremiumRow';
import { getPremiumIdFromName } from '../../../helper';
import { getString } from 'presentation/theme/localization';

export interface InsurerBlockProps {
  insurer: AggregationInsurerItem;
  expanded: boolean;
  ranges: {
    priceMin?: number;
    priceMax?: number;
    coverageMin?: number;
    coverageMax?: number;
    subModels: string[];
  };
  subModels: string[];
  selectedSub: string;
  premiums: SearchPremiumItem[];
  isSearchLoading: boolean;
  isLoadingMore: boolean;
  onToggle: (insurerId: string) => void;
  onSubModelChange: (insurerId: string, value: string) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>, insurerId: string) => void;
  expandedDescriptionPremiumId: string | null;
  premiumDetailsById: Record<string, PremiumDetailResponse>;
  onToggleDescription: (premiumName: string) => void;
  onCompare: (premiumName: string) => void;
  onPayment: (premium: SearchPremiumItem, insurerId: string) => void;
  getInsurerName: (insurerId: string) => string;
  onQuotation: (packageId: string) => void;
  columnClasses: readonly string[];
  concatWithBrandModelYear: (subModel: string) => string;
}

const InsurerBlock = memo(
  ({
    concatWithBrandModelYear,
    insurer,
    expanded,
    ranges,
    subModels,
    selectedSub,
    premiums,
    isSearchLoading,
    isLoadingMore,
    onToggle,
    onSubModelChange,
    onScroll,
    expandedDescriptionPremiumId,
    premiumDetailsById,
    onToggleDescription,
    onCompare,
    onPayment,
    getInsurerName,
    onQuotation,
    columnClasses,
  }: Readonly<InsurerBlockProps>) => {
    const loadingSearch = expanded && premiums.length === 0 && isSearchLoading;
    const handleToggle = useCallback(
      () => onToggle(insurer.insurerId),
      [onToggle, insurer.insurerId]
    );
    const handleSubModelChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        onSubModelChange(insurer.insurerId, e.target.value);
      },
      [onSubModelChange, insurer.insurerId]
    );
    const logoSrc = `${INSURER_LOGO_BASE_URL}/insurers/${insurer.insurerId}.png`;
    const handleLogoError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        const el = e.currentTarget;
        el.style.display = 'none';
      },
      []
    );
    return (
      <div className="border-b border-0 border-solid border-primaryColor border-opacity-10">
        <div
          className={clsx(
            'flex gap-4 py-4 px-4 cursor-pointer bg-[#F2F3FA] hover:bg-opacity-80',
            expanded && 'bg-opacity-80'
          )}
          onClick={handleToggle}
          onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
        >
          <div className={`flex items-center gap-2 ${columnClasses[0]}`}>
            <ChevronLeftOutlined
              className={clsx(
                '!text-base transition-transform',
                expanded && 'rotate-[-90deg]'
              )}
            />
            <img
              src={logoSrc}
              className="w-6 h-6 object-contain"
              onError={handleLogoError}
            />
            <span className="font-medium">
              {getInsurerName(insurer.insurerId)}
              <br />
              <small>
                {getString('carInsurance.packagesCount', {
                  count: insurer.packageCount,
                })}
              </small>
            </span>
          </div>
          <div className={columnClasses[1]}>—</div>
          <div className={columnClasses[2]}>—</div>
          <div className={columnClasses[3]}>
            {subModels.length > 0 && (
              <select
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white w-full max-w-[172px]"
                value={selectedSub}
                onClick={(ev) => ev.stopPropagation()}
                onChange={handleSubModelChange}
              >
                <option value="">
                  {getString('newPackageListing.selectSubModel')}
                </option>
                {subModels.map((sm) => (
                  <option key={sm} value={sm}>
                    {sm}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className={columnClasses[4]}>
            {ranges.coverageMin != null && ranges.coverageMax != null && (
              <MinMaxNumber min={ranges.coverageMin} max={ranges.coverageMax} />
            )}
          </div>
          <div className={columnClasses[5]}>—</div>
          <div className={columnClasses[6]}>
            {ranges.priceMin != null && ranges.priceMax != null && (
              <MinMaxNumber
                min={Number(ranges.priceMin)}
                max={Number(ranges.priceMax)}
              />
            )}
          </div>
        </div>
        {expanded && (
          <div
            className={clsx(
              'overflow-hidden transition-all duration-200 ease-in-out',
              loadingSearch ? 'max-h-[120px] opacity-80' : 'max-h-[512px]'
            )}
          >
            <div
              className="max-h-[512px] overflow-y-auto bg-white"
              onScroll={(e) => onScroll(e, insurer.insurerId)}
            >
              {loadingSearch && (
                <div className="flex gap-4 py-4 px-4 bg-[#F2F3FA] border-b border-gray-100">
                  {columnClasses.map((cls) => (
                    <div
                      key={`loading-${cls}`}
                      className={`${cls} h-4 animate-pulse bg-gray-200 rounded`}
                    />
                  ))}
                </div>
              )}
              {!loadingSearch &&
                premiums.map((premium) => {
                  const premiumId = getPremiumIdFromName(premium.name);
                  const isDescriptionExpanded =
                    expandedDescriptionPremiumId === premiumId;
                  return (
                    <PremiumRow
                      key={premium.name}
                      premium={premium}
                      insurerId={insurer.insurerId}
                      isDescriptionExpanded={isDescriptionExpanded}
                      premiumDetail={
                        isDescriptionExpanded
                          ? premiumDetailsById[premiumId]
                          : undefined
                      }
                      onToggleDescription={onToggleDescription}
                      onCompare={onCompare}
                      onPayment={onPayment}
                      getInsurerName={getInsurerName}
                      onQuotation={onQuotation}
                      columnClasses={columnClasses}
                      concatWithBrandModelYear={concatWithBrandModelYear}
                    />
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default InsurerBlock;
