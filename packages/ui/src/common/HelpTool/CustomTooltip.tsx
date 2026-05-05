import React, { PropsWithChildren } from 'react';
import { Tooltip as BaseTooltip, TooltipProps } from 'react-tippy';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Tooltip = BaseTooltip as any;

interface TooltipTsProps extends TooltipProps {
  children: JSX.Element;
}

/**
 * To use the default styles provided by react-tippy, import the global css in the _app.tsx of your project
 * or in the component level.
 *
 * import 'react-tippy/dist/tippy.css';
 */
function CustomTooltip(props: PropsWithChildren<TooltipTsProps>) {
  return <Tooltip {...props} />;
}

export default CustomTooltip;
