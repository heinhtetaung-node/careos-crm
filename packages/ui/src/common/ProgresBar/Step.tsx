import React from 'react';
import { Transition } from 'react-transition-group';
import { getSafePercent, transitions } from '../../utils/progressBar';

export type StepProps = {
  accomplished?: boolean;
  position?: number;
  index?: number;
  children: ({
    accomplished,
    transitionState,
    index,
    position,
  }: {
    accomplished: boolean;
    transitionState: string;
    index: number;
    position: number;
  }) => React.ReactNode;
  transition?: 'scale' | 'rotate' | 'skew';
  transitionDuration?: number;
};

function Step({
  accomplished = false,
  position = 0,
  index = 0,
  children,
  transition = 'scale',
  transitionDuration = 300,
}: StepProps) {
  const safePosition = getSafePercent(position);

  return (
    <Transition in={accomplished} timeout={transitionDuration}>
      {(state) => {
        const style = {
          left: `${safePosition}%`,
          transitionDuration: `${transitionDuration}ms`,
          ...(transition
            ? (
                transitions[transition] as {
                  [key: string]: { transform: string };
                }
              )[state]
            : {}),
        };

        return (
          <div
            data-testid="step"
            className="inline-flex justify-center items-center z-0 absolute transform -translate-x-1/2 transition-all ease-linear"
            style={style}
          >
            {children({
              accomplished,
              position: safePosition,
              transitionState: state,
              index,
            })}
          </div>
        );
      }}
    </Transition>
  );
}

export default Step;
