import clsx from 'clsx';
import React, { ButtonHTMLAttributes, useCallback } from 'react';

import AutoComplete from 'presentation/components/common/Autocomplete';
import Controls from 'presentation/components/controls/Control';
import 'presentation/components/controls/DateRangeWithType.scss';
import { useStyleClasses } from 'presentation/pages/car-insurance/orders/PrintingAndShipping/helper';
import { getString } from 'presentation/theme/localization';

const agent = [
  { text: 'Agent 1', value: 'agent 1' },
  { text: 'Agent 2', value: 'agent 2' },
  { text: 'Agent 3', value: 'agent 3' },
];

function Button({
  children,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    // eslint-disable-next-line react/button-has-type
    <button type={type} {...props}>
      {children}
    </button>
  );
}

export default function CommissionReportFilter() {
  const handleDateChange = useCallback(() => null, []);

  const handleOnClickDateChange = useCallback(() => null, []);

  const classes = useStyleClasses();
  return (
    <div
      data-testid="commission-filter"
      className="flex flex-col px-2 bg-white"
    >
      <div className="flex p-4">
        <Button
          data-testid="export-csv-btn"
          className="ml-auto border-none rounded-xl text-white px-4 py-2 bg-primary hover:bg-primary-dark font-semibold text-sm outline-none cursor-pointer"
        >
          Export CSV
        </Button>
      </div>
      <div className="flex p-4 border-y border-x-0 border-[#e9edf5] border-solid gap-3">
        <div className="flex flex-1 items-center">
          <span className="font-semibold">Period</span>
          <div
            className={clsx(
              'shared-date-range-picker ml-2',
              classes.formControl,
              classes.hideLabel,
              classes.normalizeBorderRadius
            )}
          >
            <Controls.DateRange
              className={clsx(
                classes.overwriteFormDatePosition,
                'calendar-date-range'
              )}
              name="dateRange"
              fixedLabel
              value={{ startDate: null, endDate: null }}
              onChange={handleDateChange}
              handleOnclickDateRange={handleOnClickDateChange}
            />
          </div>
        </div>
        <div className="flex flex-1 items-center">
          <span className="font-semibold">Agent</span>
          <div className="inline-block w-full ml-2">
            <AutoComplete
              textFieldProps={{
                placeholder: getString('text.select'),
                'data-testid': 'agents-filter',
              }}
              options={agent}
            />
          </div>
        </div>
      </div>
      <div className="flex p-4 border-[#e9edf5] border-solid border-b border-t-0 border-x-0">
        <span className="flex-1 font-semibold">Period</span>
        <span className="flex-1 font-semibold text-center">Tier(type1)</span>
        <span className="flex-1 font-semibold text-center">
          Tier(non-type1)
        </span>
        {/* show type for example Tier(type1) when integration start */}
        <span className="flex-1 text-right">
          <span className="font-semibold">Renewal order amount: 2 </span>
          {/* if there is no renewal amount show as Renewal order amount: 0 */}
        </span>
      </div>
      <div className="flex p-4 items-center border-[#e9edf5] border-solid border-t-0 border-b border-x-0">
        <span className="flex-1" data-testid="data-range">
          From 2022-12-31 to 2022-1-18
        </span>
        <span className="flex-1 text-center" data-testid="tier-type1-value">
          -
        </span>
        {/* show '-' for empty value */}
        <span className="flex-1 text-center" data-testid="tier-non-type1-value">
          1.5%
        </span>
        <div className="flex-1 text-right">
          <Button
            data-testid="agent-commission-btn"
            className="border-none rounded-xl text-white px-4 py-2 bg-primary hover:bg-primary-dark font-semibold text-sm outline-none cursor-pointer"
          >
            Re Calculate Agent Commission
          </Button>
        </div>
      </div>
    </div>
  );
}
