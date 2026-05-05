import AccordionSection, { AccordionItemType } from 'common/Accordion';
import Button from 'common/Button';
import React from 'react';

interface VoucherCardProps {
  title: string;
  subTitle: string;
  logo: React.ReactElement;
  description?: string;
  items: Array<AccordionItemType>;
  eligiblePeriod?: string;
  dataTestId?: string;
  btnLabel?: string | null;
  onClick: () => void;
}

function VoucherCard({
  title,
  subTitle,
  logo,
  description,
  dataTestId,
  eligiblePeriod,
  items,
  btnLabel,
  onClick,
}: VoucherCardProps) {
  return (
    <div
      className="bg-white my-[16px] rounded-lg border-[1px] border-solid border-[#E9EDF5] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      data-testid={dataTestId}
    >
      <div className="row-span-2 pl-[16px] pt-[16px] md:pb-[10px]">{logo}</div>
      <div className="lg:col-span-3 col-span-2 pr-[16px] pt-[16px] pl-[8px]">
        <span className="my-2 mx-0 font-[400] text-[16px] md:text-[20px]">
          {title}
        </span>
        <span className="my-2 md:my-0 mx-0 text-[20px] font-[600] block">
          {subTitle}
        </span>
        {eligiblePeriod && (
          <span className="text-[#757575] my-2 mx-0 text-[12px] block">
            {eligiblePeriod}
          </span>
        )}
        {description && !eligiblePeriod && (
          <span className="text-[#757575] my-2 mx-0 text-[12px] md:block hidden">
            {description}
          </span>
        )}
      </div>
      <div className="md:col-span-2 lg:col-span-3 col-span-3 px-[16px] py-[8px] md:px-[8px]">
        <span className="text-[#757575] my-2 mx-0 font-[400] text-[16px] block md:hidden">
          {description}
        </span>
      </div>
      {items.length && (
        <div className="md:col-span-3 col-span-3 lg:col-span-4 px-0">
          <AccordionSection items={items} />
        </div>
      )}
      <Button
        text={btnLabel}
        onClick={onClick}
        className="w-full col-span-2 leading-[3.5rem] md:col-span-3 lg:col-span-4 p-0 mt-[5px] rounded-b-md"
        roundedNone
      />
    </div>
  );
}

export default VoucherCard;
