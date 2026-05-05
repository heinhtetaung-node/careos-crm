/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { OptionProp } from '.';
import { CloseIcon } from '@alphafounders/icons';
import clsx from 'clsx';

interface OptionItemsProps {
  selectedItems: OptionProp[];
  limitTag: boolean;
  titleLimit?: number;
  removeSelectedItem: any;
  isOpen: boolean;
  getToggleButtonProps: any;
}

function OptionItems({
  selectedItems,
  limitTag,
  titleLimit,
  removeSelectedItem,
  isOpen,
  getToggleButtonProps,
}: Readonly<OptionItemsProps>) {
  const [items, setItems] = useState<OptionProp[]>(selectedItems);
  const shouldLimit = !isOpen && limitTag && selectedItems?.length > 2;

  useEffect(() => {
    if (shouldLimit) {
      setItems(selectedItems.slice(0, 2));
      return;
    }
    setItems(selectedItems);
  }, [shouldLimit, selectedItems]);

  const listItems = items.map((selectedItemForRender: OptionProp, index) => {
    const { title, icon } = selectedItemForRender;
    return (
      <div
        className="flex relative items-center bg-primary text-white rounded-md py-1 px-2 [&_path]:fill-white [&_svg]:fill-white"
        key={`selected-item-${index}`}
        data-testid="selected-item"
      >
        {icon && <span className="mr-2 absolute top-0.5">{icon}</span>}
        <span className={clsx(icon && 'pl-[23px]')}>
          {titleLimit ? title.substring(0, titleLimit) : title}
        </span>
        <button
          className="cursor-pointer"
          onClick={() => {
            removeSelectedItem(selectedItemForRender);
          }}
          data-testid="remove-selected-item"
        >
          <CloseIcon className="ml-2.5 w-2.5 h-2.5" fillColor="#ffffff" />
        </button>
      </div>
    );
  });
  return (
    <>
      {listItems}
      {shouldLimit && (
        <span className="bg-disabled text-body rounded-md py-1 px-2">
          <span className="px-1 cursor-pointer" {...getToggleButtonProps()}>
            +{selectedItems.length - 2} more
            <CloseIcon className="ml-2.5 w-2.5 h-2.5" fillColor="#4f4b66" />
          </span>
        </span>
      )}
    </>
  );
}

export default OptionItems;
