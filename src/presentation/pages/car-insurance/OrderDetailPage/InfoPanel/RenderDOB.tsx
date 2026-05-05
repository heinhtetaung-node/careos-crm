import { PenOutlineIcon } from '@alphafounders/icons';
import { DatePicker } from '@material-ui/pickers';
import React, { useEffect, useState } from 'react';

import { listenFixedDriverChange } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper';
import { thaiDateFormat } from 'shared/helper/thaiDateFormat';
import { format } from 'utils/datetime';

import { EditButton } from './index.style';

interface Props {
  onClose: (value: string | Date) => void;
  value: string | Date;
  placeholder?: string;
  error?: string;
  isError?: boolean;
  name?: string;
  disabledEdit?: boolean;
  isFieldDisabled?: boolean;
}

type DOB = string | Date | number | null;

function RenderDOB({
  onClose,
  value,
  placeholder = '',
  error,
  isError,
  name,
  disabledEdit = false,
  isFieldDisabled = false,
}: Readonly<Props>) {
  const [isEdit, setIsEdit] = useState(false);
  const [dateValue, setDateValue] = useState<DOB>('');
  const [isDisabled, setIsDisabled] = useState<boolean>();

  useEffect(() => {
    setDateValue(value || null);
  }, [value]);

  useEffect(() => {
    setIsDisabled(disabledEdit);
  }, [disabledEdit]);

  const onChange = (valueDOB: DOB) => {
    setDateValue(valueDOB ? format(new Date(valueDOB), 'yyyy-MM-dd') : '');
  };

  const updateIsEdit = () => {
    setIsEdit(!isEdit);
  };

  const listen = () => {
    listenFixedDriverChange(name as string).subscribe(setIsDisabled);
  };

  useEffect(() => {
    listen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  if (isFieldDisabled) {
    return <span>{`: ${thaiDateFormat(value)}`}</span>;
  }

  return (
    <>
      {' '}
      :&nbsp;
      <DatePicker
        variant="inline"
        value={dateValue}
        format="dd/MM/yyyy"
        onChange={onChange}
        onClose={() => onClose(dateValue as string)}
        InputProps={{ disableUnderline: true }}
        className={isEdit && !isDisabled ? 'date-time  ' : ''}
        invalidDateMessage=""
        placeholder={placeholder}
        helperText={isError && error}
        disabled={!isEdit || isDisabled}
        name={name}
      />
      <EditButton
        data-testid={`${name}-edit-button`}
        disabled={isDisabled}
        onClick={updateIsEdit}
      >
        <PenOutlineIcon fontSize="small" data-testid="pen-icon" />
      </EditButton>
    </>
  );
}
export default RenderDOB;
