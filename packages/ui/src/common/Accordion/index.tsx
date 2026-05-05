import React, { ReactElement, useState } from 'react';
import clsx from 'clsx';

import { ArrowDownIcon } from '@alphafounders/icons';
import TextPanel, { TextPanelItemProps } from './TextPanel';

export interface AccordionItemType {
  textDetails: string | Array<TextPanelItemProps>;
  icon?: string | null | React.ReactElement;
  titleText?: string;
  type?: 'text' | null;
  code?: string | null;
}
export interface AccordionSectionType {
  readonly items: Array<AccordionItemType>;
  readonly defaultIndex?: Array<number> | null;
  readonly cardType?: 'card' | 'accordion';
  readonly sectionIndex?: number | string | null;
}

function AccordionSection({
  items,
  defaultIndex = [],
  cardType = 'accordion',
  sectionIndex = 0,
}: Readonly<AccordionSectionType>): ReactElement {
  const isAccordion = cardType === 'accordion';
  const [openItems, setOpenItems] = useState(defaultIndex);
  const isOpenItem = (index: number) => openItems?.some((idx) => idx === index);

  const onOpenItem = (index: number) => {
    if (isOpenItem(index)) {
      setOpenItems((prev?) => prev!.filter((idx) => idx !== index));
    } else {
      setOpenItems((prev?) => [...prev!, index]);
    }
  };
  return (
    <div data-testid={`accordion-section-${sectionIndex}`}>
      {items.map((item, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={item.code}
          className={clsx(
            'border-b border-dashed border-[#E9EDF5] border-y-0',
            index === 0 && 'border-t'
          )}
        >
          <div
            data-testid={`${item.code}-title-${sectionIndex}`}
            className={clsx(
              'py-[10px] flex items-center',
              isAccordion && 'cursor-pointer hover:bg-accordionHover'
            )}
            {...(isAccordion && { onClick: () => onOpenItem(index) })}
          >
            <div className="pl-[16px] text-textColor flex-1 text-left">
              <span className="text-sm font-bold">{item.titleText}</span>
            </div>
            {isAccordion && (
              <ArrowDownIcon
                className={clsx(
                  'fill-rabbitBlue mr-[22px]',
                  'transition-all ease-in-out duration-300',
                  isOpenItem(index) ? 'rotate-180' : 'rotate-0'
                )}
              />
            )}
          </div>

          <div
            data-testid="accordion-panel"
            className={clsx(
              'transition-all ease-in-out overflow-hidden',
              isOpenItem(index)
                ? 'max-h-screen pb-[10px] duration-500'
                : 'max-h-0 duration-300'
            )}
          >
            {item.type && item.type === 'text' && (
              <TextPanel textDetails={item.textDetails} code={item?.code} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AccordionSection;
