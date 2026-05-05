import { Grid } from '@material-ui/core';
import { PlayCircleOutlineRounded } from '@material-ui/icons';
import React, { useEffect, useRef, useState } from 'react';

import { environment } from 'utils/env';
import './DaysComponentWrapper.scss';

interface IProps {
  onNextPrevious: (param: string) => void;
  isHaveToday: boolean;
}

const NEXT = 'NEXT_WEEK';
const PREVIOUS = 'PREVIOUS_WEEK';
const TEST_ENVIRONMENT = 'test';

const TransitionEndEvents = {
  WebkitTransition: 'webkitTransitionEnd',
  MozTransition: 'transitionend',
  OTransition: 'otransitionend oTransitionEnd',
  transition: 'transitionend',
};

const isElement = (el: HTMLElement) => {
  return Boolean(el && el.nodeType === Node.ELEMENT_NODE);
};

const reflow = (el: HTMLElement): boolean | number => {
  return isElement(el) && el.offsetHeight;
};

function DaysComponentWrapper({
  children,
  onNextPrevious,
  isHaveToday,
}: React.PropsWithChildren<IProps>) {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    setIsActive(true);
  }, []);
  const sharedDaysComponent = useRef<HTMLDivElement>(null);

  const getTransitionEndEvent = (element: HTMLElement): string => {
    let name: keyof typeof TransitionEndEvents;
    // TODO: we will fix this later
    // eslint-disable-next-line no-restricted-syntax
    for (name in TransitionEndEvents) {
      if (!(element?.style as any)?.[name]) {
        return TransitionEndEvents?.[name];
      }
    }
    return '';
  };

  const slideProductAnimation = (direction: string) => {
    const currentSlide: HTMLElement =
      sharedDaysComponent?.current?.querySelector(
        '.shared-days-wrapper-component.active'
      ) as HTMLElement;
    const nextSlide: HTMLElement = sharedDaysComponent?.current?.querySelector(
      '.shared-days-wrapper-component:not(.active)'
    ) as HTMLElement;

    let dirClass = '';
    let overlayClass = '';
    if (direction === NEXT) {
      dirClass = 'shared-days-wrapper-component-left';
      overlayClass = 'shared-days-wrapper-component-next';
    } else if (direction === PREVIOUS) {
      dirClass = 'shared-days-wrapper-component-right';
      overlayClass = 'shared-days-wrapper-component-prev';
    }

    const transitionEndEvent = getTransitionEndEvent(currentSlide);
    // INFO: .split(/\s+/) to trim all the space.
    const events = transitionEndEvent.split(/\s+/);
    nextSlide.classList.add(overlayClass);

    reflow(nextSlide);
    currentSlide.classList.add(dirClass);
    nextSlide.classList.add(dirClass);

    const onceTransEnd = () => {
      currentSlide.removeEventListener(events[0], onceTransEnd);
      nextSlide.classList.remove(dirClass);
      nextSlide.classList.remove(overlayClass);
      nextSlide.classList.add('active');
      currentSlide.classList.remove('active');
      currentSlide.classList.remove(dirClass);
      currentSlide.classList.remove(overlayClass);
    };
    currentSlide.addEventListener(events[0], onceTransEnd);
  };

  const handleClickWrapper = (action: string) => {
    onNextPrevious(action);
    if (environment !== TEST_ENVIRONMENT) {
      slideProductAnimation(action);
    }
  };

  return (
    <div className="shared-days-wrapper" ref={sharedDaysComponent}>
      <div className="shared-days-wrapper__container">
        <Grid
          container
          className={`shared-days-wrapper-component primary ${
            isActive ? 'active' : ''
          }`}
        >
          {children}
        </Grid>
        <Grid container className="shared-days-wrapper-component secondary">
          {children}
        </Grid>
      </div>
      <div className="shared-days-component__container__arrows">
        <PlayCircleOutlineRounded
          className={`arrow left-arrow  ${isHaveToday ? 'disable' : ''}`}
          fontSize="large"
          onClick={() => handleClickWrapper(PREVIOUS)}
          data-testid="left-arrow"
        />
        <PlayCircleOutlineRounded
          className="arrow right-arrow unittest-right-arrow"
          fontSize="large"
          onClick={() => handleClickWrapper(NEXT)}
          data-testid="right-arrow"
        />
      </div>
    </div>
  );
}

export default DaysComponentWrapper;
