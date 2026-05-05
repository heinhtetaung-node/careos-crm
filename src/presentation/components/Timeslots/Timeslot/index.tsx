import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import React, { MouseEvent, useState } from 'react';

import { getString } from 'presentation/theme/localization';

import { IUpdateData, ITimeslot } from '../TimeslotsHelper';
import './timeSlot.scss';

interface IProps {
  data: ITimeslot;
  slots: number[];
  showTimeSelection?: boolean;
  onSelectSlot: (data: IUpdateData) => void;
  showAppointmentDetail: (currentTarget: HTMLDivElement) => void;
}

function TimeSlot({
  data,
  slots,
  showTimeSelection,
  onSelectSlot,
  showAppointmentDetail,
}: IProps) {
  const [open, setOpen] = useState(false);
  const [positionTop, setPositionTop] = useState(0);
  const SLOT_HEIGHT = 40;

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const parentHeight =
      document.getElementById('container')?.clientHeight || 0;
    const offsetTop = event.currentTarget?.offsetTop || 0;
    const listHeght = slots.length * SLOT_HEIGHT;

    if (!data.type) {
      setOpen(showTimeSelection ? !open : false);
    } else {
      const { currentTarget } = event;
      showAppointmentDetail(currentTarget);
    }

    const offset =
      listHeght + offsetTop > parentHeight
        ? parentHeight - offsetTop - listHeght
        : 0;

    setPositionTop(offset);
    const arrowElement = event.currentTarget.children[0]
      .children[0] as HTMLDivElement;
    arrowElement.style.setProperty('--arrow-top', `${10 - offset}px`);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const selectTimeSlot = (item: number) => {
    onSelectSlot({ startTime: data.time, length: item });
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div
        className={`timeslot-item ${data.type ? data.type : ''} 
          ${open ? 'active' : ''}
          ${data.isActive ? 'active' : ''}
          ${data.group !== undefined ? 'group' : ''}
          ${data.position ? data.position : ''}`}
        onClick={(event) => handleClick(event)}
        aria-hidden="true"
        data-testid={data.time}
      >
        {data.time}
        {slots ? (
          <ul
            className={`timeslot-select ${open ? 'show' : ''} 
              ${data.isStartRow ? 'start-row' : ''}`}
            style={{ top: positionTop }}
            data-testid={`callduraction-list-${data.time}`}
          >
            <span className="timeslot-select__arrow" />
            {slots.map((item: number) => {
              return (
                <li
                  className="timeslot-select__item"
                  key={item}
                  onClick={() => selectTimeSlot(item)}
                  role="presentation"
                >
                  {item}
                  &nbsp;
                  {getString('text.minutes')}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </ClickAwayListener>
  );
}

export default TimeSlot;
