/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { ArrowDownIcon, CloseIcon } from '@alphafounders/icons';
import OptionItems from './OptionItems';
import Checkbox from '../Checkbox';

export interface OptionProp {
  title: string;
  value: string;
  icon?: React.ReactElement;
}

interface AutocompleteProps {
  optionType?: 'default' | 'checkbox';
  options: OptionProp[];
  label?: string;
  limitTag?: boolean;
  titleLimit?: number;
  showClearButton?: boolean;
  onChange: (value: OptionProp[]) => void;
}

function getFilteredOptions(
  options: OptionProp[],
  selectedItems: any,
  inputValue: any
) {
  const lowerCasedInputValue = inputValue.toLowerCase();
  return options.filter((option) => {
    return (
      !selectedItems.find((item: OptionProp) => option.title === item.title) &&
      option.title.toLowerCase().includes(lowerCasedInputValue)
    );
  });
}

function Autocomplete({
  optionType = 'default',
  options,
  label,
  limitTag = true,
  titleLimit,
  showClearButton = true,
  onChange,
}: Readonly<AutocompleteProps>) {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<OptionProp[]>([]);

  const items = useMemo(() => {
    if (optionType === 'checkbox') return options; // keep the items remain on the list
    return getFilteredOptions(options, selectedItems, inputValue);
  }, [optionType, options, selectedItems, inputValue]);

  const { getDropdownProps, removeSelectedItem, reset } = useMultipleSelection({
    selectedItems,
    onStateChange({ selectedItems: newSelectedItems, type }) {
      switch (type) {
        case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
        case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
        case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
        case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
          setSelectedItems(newSelectedItems ?? []);
          break;
        case useMultipleSelection.stateChangeTypes.FunctionReset:
          setSelectedItems([]);
          break;
        default:
          break;
      }
    },
  });

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useCombobox({
    items,
    itemToString(item) {
      return item ? item.title : '';
    },
    defaultHighlightedIndex: 0, // after selection, highlight the first item.
    selectedItem: null,
    inputValue,
    stateReducer(_state, actionAndChanges) {
      const { changes, type } = actionAndChanges;

      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep the menu open after selection.
            highlightedIndex: 0, // with the first option highlighted.
          };
        default:
          return changes;
      }
    },

    onStateChange({
      inputValue: newInputValue,
      type,
      selectedItem: newSelectedItem,
    }) {
      if (optionType === 'checkbox') return;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (newSelectedItem) {
            setSelectedItems([...selectedItems, newSelectedItem]);
            setInputValue('');
          }
          break;

        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(newInputValue ?? '');
          break;
        default:
          break;
      }
    },

    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return;
      const itemExists = selectedItems.find(
        (item) => item.value === selectedItem.value
      );
      if (itemExists) {
        setSelectedItems((prevItems) =>
          prevItems.filter((item) => item.value !== selectedItem.value)
        );
      } else {
        setSelectedItems([...selectedItems, selectedItem]);
      }
    },
  });

  useEffect(() => {
    onChange(selectedItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems]);

  const transparentBtnClass =
    'border-0 bg-transparent outline-0 text-primary cursor-pointer';
  return (
    <div className="w-full font-body">
      {label && (
        <label className="w-fit" {...getLabelProps()}>
          {label}
        </label>
      )}
      <div className="flex min-h-[47px] flex-col gap-1 border border-solid border-primary rounded-[10px] shadow-sm bg-white">
        <div className="inline-flex min-h-[31px] relative gap-2 items-center flex-wrap p-2 px-4 text-sm pr-16">
          <OptionItems
            {...{
              selectedItems,
              limitTag,
              titleLimit,
              removeSelectedItem,
              isOpen,
              getToggleButtonProps,
            }}
          />
          <input
            className="w-0 min-w-[30px] border-0 outline-0 grow"
            {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
          />
          <div className="flex absolute top-2.5 right-0">
            {showClearButton && selectedItems.length > 0 && (
              <button
                className={transparentBtnClass}
                type="button"
                onClick={reset}
              >
                <CloseIcon className="m-0" />
              </button>
            )}
            <button
              aria-label="toggle menu"
              className={transparentBtnClass}
              type="button"
              {...getToggleButtonProps()}
            >
              <ArrowDownIcon
                className={clsx(isOpen && 'rotate-180', 'w-6 h-6 ml-0')}
              />
            </button>
          </div>
        </div>
        <ul
          className={`w-inherit bg-transparent mt-1 mb-0 max-h-80 overflow-y-auto overflow-x-none p-0 scroll-smooth text-body ${
            !(isOpen && items.length) && 'hidden'
          }`}
          {...getMenuProps()}
        >
          {isOpen &&
            items.map((item: OptionProp, index) => (
              <li
                className={clsx(
                  highlightedIndex === index && 'bg-disabled',
                  selectedItem === item && 'font-bold',
                  'py-2 px-3 flex flex-col'
                )}
                key={`${item.value}${index}`}
                {...getItemProps({
                  item,
                  index,
                  'aria-selected': selectedItems.includes(item),
                })}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="mr-1">{item?.icon && item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  {optionType === 'checkbox' && (
                    <Checkbox
                      onChange={() => null}
                      value={item?.value}
                      checked={selectedItems.includes(item)}
                    />
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default Autocomplete;
