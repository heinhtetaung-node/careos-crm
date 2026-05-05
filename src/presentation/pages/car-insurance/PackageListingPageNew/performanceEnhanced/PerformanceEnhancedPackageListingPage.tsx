import CustomModal from 'presentation/components/common/CustomModal';
import { PackagesList } from 'presentation/components/Packages/PackagesList';
import React, { memo } from 'react';
import CompareBar from '../CompareBar';
import FilterSideBar from '../FilterSideBar';
import FilterTop from '../FilterTop';
import EnhancedMiddleContent from './app/view/layout/EnhancedPackageList';
import { usePerformanceEnhancedPackageListing } from './app/controller/usePerformanceEnhancedPackageListing';

// Memoized sections to avoid re-renders when parent state unrelated to them changes
const MemoFilterSideBar = memo(FilterSideBar);
MemoFilterSideBar.displayName = 'MemoFilterSideBar';

const MemoFilterTop = memo(FilterTop);
MemoFilterTop.displayName = 'MemoFilterTop';

const MemoEnhancedMiddleContent = memo(EnhancedMiddleContent);
MemoEnhancedMiddleContent.displayName = 'MemoEnhancedMiddleContent';

export default function PerformanceEnhancedPackageListingPage() {
  const {
    layoutState,
    filterSideBarProps,
    filterTopProps,
    enhancedMiddleProps,
    packagesListProps,
    modalProps,
    compareBarProps,
  } = usePerformanceEnhancedPackageListing();
  const { showFilterTop, showMainContent } = layoutState;
  const { listProps } = packagesListProps;
  return (
    <div className="-mt-2 grid grid-cols-5 bg-white gap-2 p-2 h-[90vh] overflow-hidden">
      <div className="col-span-1">
        <MemoFilterSideBar {...filterSideBarProps} />
      </div>
      <div className="col-span-4 flex flex-col gap-2 overflow-scroll">
        {showFilterTop && (
          <div className="">
            <MemoFilterTop {...filterTopProps} />
          </div>
        )}
        {showMainContent && (
          <>
            <div className="flex flex-row gap-2 h-[58vh]">
              <div className="w-full overflow-hidden">
                <MemoEnhancedMiddleContent {...enhancedMiddleProps} />
              </div>
            </div>
            <div className="pb-12 h-60">
              <PackagesList {...listProps} />
              <div className="h-24 w-full" />
            </div>
          </>
        )}
      </div>
      <CustomModal show={modalProps.show} onClose={modalProps.handleCloseModal}>
        {modalProps.openedPackage.map((data: any) => (
          <div key={data.id}>
            {modalProps.renderPackageCard(data, modalProps.setOpenedPackage)}
          </div>
        ))}
      </CustomModal>
      <CompareBar
        packages={compareBarProps.packages}
        savePackages={compareBarProps.savePackages}
        useMultipleSuminsured={false}
        filter={compareBarProps.filterValues}
        removePackage={compareBarProps.removePackage}
        maxCompareLimit={compareBarProps.maxCompareLimit}
      />
    </div>
  );
}
