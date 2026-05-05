import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import React, { useEffect } from 'react';

import { thaiDateFormat } from 'shared/helper/thaiDateFormat';

import { isCharContain } from './helper';
import { Colon, FieldItem } from './index.style';

interface Props {
  // INFO: base props
  value: Date | null | string;
  name?: string;
  onUpdateOrder: (payload: any) => void;
  format?: string;
  isFieldDisabled?: boolean;

  // INFO: the props using for custom
  onHandleChangeDate?: (value: any) => void;
  setShowHighlight?: (status: boolean) => void;
  error?: string;
  addColon?: boolean;
  isDisabled?: boolean;
  isPossibleInput?: boolean;
}

function RenderInputDateItem({
  name = '',
  value,
  onUpdateOrder,
  format = '',
  onHandleChangeDate,
  setShowHighlight = () => null,
  error = '',
  addColon = true,
  isDisabled = false,
  isPossibleInput = true,
  isFieldDisabled = false,
}: Props) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null | string>(
    value
  );

  useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  useEffect(() => {
    if (selectedDate == null || !isCharContain(String(selectedDate))) {
      setShowHighlight(true);
      return;
    }
    setShowHighlight(false);
  }, [selectedDate, setShowHighlight]);

  const formatDate = (date: Date | null) => {
    if (date) {
      const day = date?.getDate();
      const month = date?.getMonth() + 1;
      return `${date?.getFullYear()}-${month <= 9 ? `0${month}` : month}-${
        day <= 9 ? `0${day}` : day
      }`;
    }
    return null;
  };

  const handleAcceptDate = (date: Date | null) => {
    setSelectedDate(date);
    onUpdateOrder({
      name,
      value: formatDate(date),
    });
  };

  const onChangeDate = (val: any) => {
    if (val && onHandleChangeDate) {
      onHandleChangeDate(val);
    }
    return null;
  };

  if (isFieldDisabled) {
    return (
      <FieldItem data-testid="disabled-datefield">
        {addColon ? <Colon>: </Colon> : null}
        {thaiDateFormat(selectedDate)}
      </FieldItem>
    );
  }

  return (
    <FieldItem>
      {addColon ? <Colon>: </Colon> : null}
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          disableToolbar
          format={format || thaiDateFormat(selectedDate || new Date())}
          value={selectedDate || ''}
          onChange={onChangeDate}
          KeyboardButtonProps={{
            'aria-label': 'change date',
            disabled: isDisabled,
          }}
          helperText={error}
          onAccept={handleAcceptDate}
          InputProps={{
            readOnly: isDisabled || !isPossibleInput,
            disabled: isDisabled,
          }}
        />
      </MuiPickersUtilsProvider>
    </FieldItem>
  );
}

export default RenderInputDateItem;
