import React, { useEffect, useState } from 'react';

import DatePickerWithThaiYear from 'presentation/components/controls/DatePickerWithThaiYear';
import { ageValidationFn } from 'presentation/components/modal/FixedDriverModal/helper';
import { listenFixedDriverChange } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper';
import { Colon } from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/index.style';
import { isValid } from 'utils/datetime';
import clsx from 'clsx';

import useStyles from './RenderDOB.style';

interface Props {
  onClose: (value: string | Date) => void;
  value: string | Date;
  placeholder?: string;
  error?: string;
  name?: string;
  isDisabled?: boolean;
  isFieldDisabled?: boolean;
  className?: string;
}

function RenderDOB({
  onClose,
  value,
  placeholder = '',
  error,
  name,
  className = '',
  isDisabled = false,
  isFieldDisabled = false,
}: Readonly<Props>) {
  const classes = useStyles();
  const [isDriverDobDisabled, setIsDriverDobDisabled] = useState<boolean>();

  const handleChangeDate = (date: any) => {
    const dateString = date && isValid(new Date(date)) ? date : '';
    onClose(dateString);
  };

  const listen = () => {
    listenFixedDriverChange(name as string).subscribe(setIsDriverDobDisabled);
  };

  useEffect(() => {
    listen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    setIsDriverDobDisabled(isDriverDobDisabled);
  }, [isDriverDobDisabled]);

  return (
    <>
      <Colon>: </Colon>
      <DatePickerWithThaiYear
        className={clsx(classes.root, className)}
        onChangeDate={handleChangeDate}
        value={value}
        placeholder={placeholder}
        error={error}
        name={name}
        isFieldDisabled={isFieldDisabled || isDriverDobDisabled}
        isDisabled={isDisabled}
        validateFn={ageValidationFn}
      />
    </>
  );
}
export default RenderDOB;
