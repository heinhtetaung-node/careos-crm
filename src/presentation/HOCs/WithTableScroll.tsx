import React, { useEffect, useRef } from 'react';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import './WithTableScroll.scss';

const destroyComponent$ = new Subject();

const WithTableScrollHoc = (Component: React.ComponentType<any>) => {
  const WrapperComponent: React.FC<any> = (props: any) => {
    const dataTableContainer = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const slider = dataTableContainer.current as HTMLElement;
      let isDown = false;
      let startX = 0;
      const scrollBar = slider?.children?.[0];
      let scrollLeft = 0;
      if (slider) {
        if (scrollBar) {
          fromEvent(scrollBar, 'mouseenter')
            .pipe(
              takeUntil(destroyComponent$),
              tap(() => {
                scrollBar.classList.add('cursor-table-scroll-horizontal');
              })
            )
            .subscribe();
          fromEvent(scrollBar, 'mouseleave')
            .pipe(
              takeUntil(destroyComponent$),
              tap(() =>
                scrollBar.classList.remove('cursor-table-scroll-horizontal')
              )
            )
            .subscribe();
        }
        fromEvent(slider, 'mousedown')
          .pipe(
            takeUntil(destroyComponent$),
            tap((event) => {
              const declareEventType = event as MouseEvent;
              isDown = true;
              startX = declareEventType?.pageX - slider.offsetLeft;
              scrollLeft = slider.scrollLeft;
            })
          )
          .subscribe();

        fromEvent(slider, 'mouseleave')
          .pipe(
            takeUntil(destroyComponent$),
            tap(() => {
              isDown = false;
            })
          )
          .subscribe();

        fromEvent(slider, 'mouseup')
          .pipe(
            takeUntil(destroyComponent$),
            tap(() => {
              isDown = false;
            })
          )
          .subscribe();
        fromEvent(slider, 'mousemove')
          .pipe(
            takeUntil(destroyComponent$),
            tap((event) => {
              const declareEventType = event as MouseEvent;
              if (!isDown) return;
              event.preventDefault();
              const x = declareEventType.pageX - slider.offsetLeft;
              const walk = (x - startX) * 2;
              slider.scrollLeft = scrollLeft - walk;
            })
          )
          .subscribe();
        return () => {
          destroyComponent$.next(true);
        };
      }
      return () => null;
    }, []);

    return (
      <div>
        <Component {...props} tableRefContainer={dataTableContainer} />
      </div>
    );
  };
  return WrapperComponent;
};

export default WithTableScrollHoc;
