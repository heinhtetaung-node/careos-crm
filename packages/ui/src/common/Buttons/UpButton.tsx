import React, { useState, useEffect, ReactElement } from 'react';
import clsx from 'clsx';
import { ArrowDownIcon } from '@alphafounders/icons';

type ScreenSizeType = {
  EXTRA_SMALL: number;
  SMALL: number;
  MEDIUM: number;
  LARGE: number;
  EXTRA_LARGE: number;
};

interface UpButtonProps {
  readonly questionOrder: Array<string>;
  readonly buttonLabel?: string;
  readonly screenSize: ScreenSizeType;
  readonly icon?: ReactElement;
}

function UpButton({
  questionOrder,
  buttonLabel,
  screenSize,
  icon,
}: UpButtonProps) {
  const [show, setShow] = useState<boolean>(false);

  const updateDisplay = () => {
    setShow(window?.scrollY > 200 && window?.innerWidth <= screenSize?.SMALL);
  };

  const offset = (el: HTMLElement) => {
    const rect = el?.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect?.left + scrollLeft };
  };

  const scrollUp = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // nearest upper Question
    const userCurrentPosition = window.scrollY;
    const progressBarSize = 65;

    const upperQuestion = questionOrder.reduce(
      (previous, qn) =>
        offset(document.getElementById(qn) as HTMLElement).top <
        userCurrentPosition
          ? qn
          : previous,
      ''
    );
    const upperQnBlock = document.getElementById(upperQuestion);
    // Navigate user to previous question
    window.scrollTo({
      top: offset(upperQnBlock as HTMLElement).top - progressBarSize,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('resize', updateDisplay);
    window.addEventListener('scroll', updateDisplay);
    return () => {
      window.removeEventListener('resize', updateDisplay);
      window.removeEventListener('scroll', updateDisplay);
    };
  }, []);

  return (
    <button
      className={clsx(
        'fixed top-[5.125rem] right-[1.25rem] z-30',
        show && 'visible md:hidden',
        !show && 'invisible'
      )}
      onClick={scrollUp}
      type="button"
      data-testid="up-button"
    >
      <div
        className={clsx(
          'bg-borderColor rounded-full w-[40px] h-[40px] py-[3px] px-[11px] text-sm',
          'flex flex-col items-center justify-center'
        )}
      >
        {icon || (
          <ArrowDownIcon className="text-[#005098] w-[40px] h-[40px] rotate-180 ml-0" />
        )}
        <div className="text-[#005098]">{buttonLabel}</div>
      </div>
    </button>
  );
}

export default UpButton;
