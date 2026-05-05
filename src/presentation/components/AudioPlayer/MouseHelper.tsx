import { MouseEvent } from 'react';

export default class MouseHelper {
  static getMousePositionInElement(e: MouseEvent, elem: HTMLElement): number {
    if (!e || !elem) {
      return 0;
    }
    const clickPositionInPage = e.pageX;
    const barStart = elem.getBoundingClientRect().left + window.scrollX;
    const clickPositionInBar = clickPositionInPage - barStart;

    return clickPositionInBar;
  }

  static isLeftMouseHeld(e: MouseEvent) {
    return e.nativeEvent.which === 0;
  }
}
