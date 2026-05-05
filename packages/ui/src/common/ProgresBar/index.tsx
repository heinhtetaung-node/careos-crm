import React from 'react';
import { getSafePercent, getStepPosition } from '../../utils/progressBar';
import Step, { StepProps } from './Step';
import clsx from 'clsx';

type ProgressBarProps = {
  percent: number;
  stepPositions?: Array<number>;
  unfilledBackground?: string;
  filledBackground?: string;
  width?: number;
  height?: number;
  hasStepZero?: boolean;
  text?: string;
  children?: React.ReactElement<typeof Step>[];
  progressionClasses?: string;
  progressBarClasses?: string;
};

function ProgressBar({
  percent,
  stepPositions = [],
  unfilledBackground = '',
  filledBackground = '',
  width,
  height,
  hasStepZero = true,
  text,
  progressionClasses,
  progressBarClasses,
  children,
}: Readonly<ProgressBarProps>) {
  if (
    stepPositions &&
    stepPositions.length > 0 &&
    stepPositions.length !== React.Children.count(children)
  ) {
    throw new Error(
      'When specifying a stepPositions prop, the number of children must match the length of the positions array.'
    );
  }

  const safePercent = getSafePercent(percent);

  const renderChildren = () => {
    return React.Children.map(children, (step, index) => {
      const position: number =
        stepPositions?.length > 0
          ? stepPositions[index]
          : getStepPosition(React.Children.count(children), index, hasStepZero);
      return step
        ? React.cloneElement(step, {
            accomplished: position <= safePercent,
            position,
            index,
          } as StepProps)
        : null;
    });
  };

  return (
    <div
      data-testid="progress-bar"
      className={clsx(
        'h-2.5 leading-none relative bg-gray-300 flex justify-between items-center z-0 rounded-10',
        progressBarClasses
      )}
      style={{ background: unfilledBackground, width, height }}
    >
      {renderChildren()}
      {text && (
        <div className="text-white text-[10px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {text}
        </div>
      )}
      <div
        className={clsx(
          'absolute transition-all duration-300 ease-in-out inset-0 rounded-10 z-[-1]',
          progressionClasses
        )}
        style={{
          width: `${safePercent}%`,
          backgroundColor: filledBackground,
        }}
      />
    </div>
  );
}

export default ProgressBar;
