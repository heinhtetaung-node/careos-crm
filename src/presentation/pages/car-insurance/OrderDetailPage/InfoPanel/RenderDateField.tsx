import { PenOutlineIcon } from '@alphafounders/icons';
import TextField from '@material-ui/core/TextField';
import React, { useState } from 'react';

import LocalStorage, { LOCALSTORAGE_KEY } from 'shared/helper/LocalStorage';
import {
  format,
  sub,
  parse,
  isValidDateFormat,
  differenceInYears,
  DateType,
} from 'utils/datetime';

import { getBirthDateError, getDateError, getDateObj } from './helper';
import { Colon, FieldItem, EditButton } from './index.style';

const localStorageService = new LocalStorage();
const isThai =
  localStorageService.getItemByKey(LOCALSTORAGE_KEY.LOCALE) === 'th';

export const getAge = (input: DateType) => {
  const dateObj = getDateObj(input);
  if (typeof dateObj === 'object') {
    return differenceInYears(new Date(), dateObj);
  }
  return 0;
};

export default function RenderDateField({
  name = '',
  onUpdateOrder,
  dateType,
  isEditable = false,
}: Readonly<{
  name: string | undefined;
  onUpdateOrder: (payload: any) => void;
  value: Date | null | string;
  dateType?: string;
  isEditable?: boolean;
}>) {
  const [selectedDate, setSelectedDate] = useState<Date | null | string>('');
  const [error, setError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<null | string>('');
  const [isEditing, setIsEditing] = useState(false);

  // useEffect(() => {
  //   const val = () => {
  //     if (value) {
  //       if (isThai) {
  //         return format(add(new Date(value), { years: 543 }), 'dd/MM/yyyy');
  //       }
  //       return format(new Date(value), 'dd/MM/yyyy');
  //     }
  //     return '';
  //   };

  //   setSelectedDate(val);
  // }, [value]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (event: any) => {
    setIsEditing(true);
    setSelectedDate(event.target.value);
  };

  const _formatDate = (dateEntered: string) =>
    isThai
      ? format(sub(new Date(dateEntered), { years: 543 }), 'yyyy-MM-dd')
      : format(new Date(dateEntered), 'yyyy-MM-dd');

  const updateDate = (dateEntered: string) => {
    // const finalDate = formatDate(dateEntered);
    setError(false);
    setErrorMsg('');
    onUpdateOrder({
      name,
      value: dateEntered,
    });
  };

  const validateDate = (dateEntered: string) => {
    const input = isThai
      ? sub(new Date(dateEntered), { years: 543 })
      : dateEntered;

    const age = getAge(input);
    if (input) {
      if (dateType === 'birthdate') {
        if (age >= 18 && age <= 100) {
          updateDate(dateEntered);
        } else {
          setError(true);
          const msg = getBirthDateError(age);
          setErrorMsg(msg);
        }
      } else {
        updateDate(dateEntered);
      }
    }
  };

  const handleUpdateDate = (event: any) => {
    const input = format(
      parse(event.target.value, 'dd/MM/yyyy', new Date()),
      'dd/MM/yyyy'
    );

    setSelectedDate(input);
    if (isValidDateFormat(input, 'dd/MM/yyyy')) {
      setIsEditing(false);
      validateDate(event.target.value);
    } else {
      setSelectedDate(event.target.value);
      setError(true);
      setErrorMsg(getDateError());
    }
  };

  const handleClick = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };

  return (
    <FieldItem data-testid="date-input-field">
      <Colon>: </Colon>
      <TextField
        value={selectedDate}
        name={name}
        onClick={handleClick}
        onChange={handleChange}
        onBlur={handleUpdateDate}
        InputLabelProps={{ shrink: true }}
        error={!!error}
        helperText={errorMsg}
        inputProps={{
          'data-testid': 'date-input-textfield',
          'aria-label': 'date-field',
          readOnly: !isEditing,
        }}
      />
      {isEditable && (
        <EditButton onClick={toggleEdit} data-testid="text-input-field-edit">
          <PenOutlineIcon fontSize="small" />
        </EditButton>
      )}
    </FieldItem>
  );
}
