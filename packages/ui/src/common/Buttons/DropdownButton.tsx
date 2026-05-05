import clsx from 'clsx';
import _orderBy from 'lodash/orderBy';
import React, { useRef, useState } from 'react';

import useUIContext from 'Context/useUIContext';
import { ArrowDownIcon } from '@alphafounders/icons';
import ClickAwayListener from 'utils/clickAwayListener';

interface DropdownButtonProps {
  text: string;
  options?: {
    id: string;
    name: string;
    isPrimary?: boolean;
    actionElem?: JSX.Element;
    onClick?: () => void;
  }[];
  classes?: string;
}

function DropdownButton({
  options,
  text = '',
  classes = '',
}: DropdownButtonProps) {
  const [isShowDropdown, setShowDropdown] = useState(false);
  const { t } = useUIContext();
  const ref = useRef(null);

  const triggerDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  ClickAwayListener(ref, () => setShowDropdown(false));

  return (
    <div className="relative w-full" ref={ref} data-testid="dropdownButton">
      <div
        className="text-primary rounded-lg text-sm px-4 py-2.5 text-center items-center border-1 border-solid border-[#b0c6e3] bg-white flex gap-2"
        onClick={triggerDropdown}
        onKeyDown={triggerDropdown}
        role="button"
        tabIndex={0}
      >
        <span className="w-full overflow-hidden" title={text || t('select')}>
          {text || t('select')}
        </span>
        <ArrowDownIcon />
      </div>
      <div className="absolute z-[1200] top-11 left-2 bg-white rounded-lg shadow min-w-54">
        <ul
          className={clsx(
            'm-0 bg-white p-1 text-sm text-gray-700 list-none border-1 border-solid border-gray-200 max-h-[240px] overflow-y-auto',
            {
              hidden: !isShowDropdown,
              [classes]: true,
            }
          )}
        >
          {options?.length ? (
            _orderBy(options, ['isPrimary', 'name'], ['desc', 'asc']).map(
              (list) => (
                <li
                  key={list.id}
                  data-testid="dropdownButtonList"
                  className={clsx(
                    'flex justify-between items-center w-auto leading-4 p-2 hover:bg-gray-200 border-0 border-l-2 border-solid border-transparent',
                    {
                      'border-primary': list?.isPrimary,
                    }
                  )}
                  onClick={list?.onClick}
                  onKeyDown={list?.onClick}
                  role="button"
                  tabIndex={0}
                >
                  {list.name}
                  <span>{list?.actionElem}</span>
                </li>
              )
            )
          ) : (
            <li data-testid="noData" className="p-2">
              {t('noData')}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default DropdownButton;
