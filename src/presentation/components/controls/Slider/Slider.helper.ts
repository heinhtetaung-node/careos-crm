import React from 'react';
import { BehaviorSubject } from 'rxjs';

import ISliderInterface from './SliderInterface';

export const clearSliderValue = new BehaviorSubject(false);
export const clearSliderValue$ = clearSliderValue.asObservable();
export default class SliderHelper extends ISliderInterface {
  countCharacters = (char: string, string: string): number => {
    return string
      .split('')
      .reduce((acc, cur) => (cur === char ? acc + 1 : acc), 0);
  };

  public handleKeyDown = (
    event: KeyboardEvent & Partial<React.ChangeEvent<HTMLInputElement>>,
    inputValue: string
  ): void => {
    const countMinus = this.countCharacters('-', inputValue);
    const { keyCode } = event;
    if (event.shiftKey) {
      event.preventDefault();
      return;
    }

    if (
      countMinus === 0 &&
      (keyCode === 189 || keyCode === 109) &&
      !inputValue.length
    ) {
      event.preventDefault();
      return;
    }

    if (countMinus > 0 && (keyCode === 189 || keyCode === 109)) {
      event.preventDefault();
      return;
    }

    if (
      keyCode !== 9 &&
      keyCode !== 8 &&
      keyCode !== 37 &&
      keyCode !== 39 &&
      keyCode !== 190 &&
      keyCode !== 110 &&
      (keyCode < 48 || (keyCode > 57 && keyCode !== 189 && keyCode !== 109)) &&
      ((keyCode > 105 && keyCode !== 189 && keyCode !== 109) || keyCode < 96)
    ) {
      event.preventDefault();
      return;
    }

    if (keyCode === 190 || keyCode === 110) {
      event.preventDefault();
      return;
    }

    if (
      event.target.value.split('.')[1]?.length > 1 &&
      ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))
    ) {
      event.preventDefault();
    }
  };

  public formatToString = (text: string, max: number): string => {
    const newText = text.replace(/,/g, '');
    const splitNumber = newText.split('-');
    const formatNumber = [...splitNumber];
    const formatMaxItems = formatNumber.map((item) =>
      Number(item) > max ? max.toString() : item
    );

    return formatMaxItems.join('-') ?? '';
  };

  public formatStringToArray = (text: string): number[] => {
    const newText = text.replace(/,/g, '');
    return newText
      .split('-')
      .filter((item) => item !== '')
      .map((item) => Number(item)) as number[];
  };
}
