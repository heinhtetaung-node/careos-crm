import clsx from 'clsx';
import React from 'react';
import { Position, Trigger } from 'react-tippy';

import { QuestionCircle } from '@alphafounders/icons';

import CustomTooltip from './CustomTooltip';

type HelpToolProps = {
  tip: string;
  extraClasses?: string;
  position?: Position;
  trigger?: Trigger;
  arrow?: boolean;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  html?: React.ReactElement<any>;
};

/**
 * To use the default styles provided by react-tippy, import the global css in the _app.tsx of your project
 * or in the component level.
 *
 * import 'react-tippy/dist/tippy.css';
 */
function HelpTool({
  tip,
  extraClasses,
  position = 'bottom',
  trigger,
  arrow = true,
  label,
  html,
}: Readonly<HelpToolProps>) {
  return (
    <button
      data-testid="tooltip-icon"
      className={clsx('ml-2 mt-0.5', [extraClasses])}
    >
      <CustomTooltip
        title={tip}
        html={html}
        position={position}
        trigger={trigger}
        arrow={arrow}
      >
        {label ? (
          <span>{label}</span>
        ) : (
          <QuestionCircle className="w-[15px] h-[15px]" />
        )}
      </CustomTooltip>
    </button>
  );
}

export default HelpTool;
