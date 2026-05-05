/* eslint-disable react/jsx-no-useless-fragment */
import { CrossIcon, TickIcon } from '@alphafounders/icons';
import { LabelWithIcon } from '@alphafounders/ui';
import { makeStyles } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';

import RadioGroupField from 'presentation/components/common/FormikFields/FormikRadioField';
import CopyToClipboard from 'presentation/components/CopyToClipboard';
import RenderDOB from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/RenderDOB';
import RenderInputSelectItem from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/RenderInputSelectItem';
import { getString } from 'presentation/theme/localization';

import {
  changeFixedDriver,
  getErrorWhenChangeDOB,
  IFieldValue,
  renderInputType,
} from './helper';
import InputData from './InputData';

import { getCustomerSectionTitle } from '../leadDetailsPage.helper';

interface IHandleSelectChange {
  name: string;
  value: string | number;
}
interface Props {
  objValue: IFieldValue;
  onSaveCustomerInputInfo: (
    value: string | number | Date,
    path: string,
    op?: 'add' | 'remove'
  ) => void;
  formValues: Record<string, any>;
  isFieldDisabled?: boolean;
}

const useStyles = makeStyles(() => ({
  radioGroup: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function RenderValue({
  objValue,
  onSaveCustomerInputInfo,
  formValues,
  isFieldDisabled = false,
}: Props) {
  const classes = useStyles();
  const [objState, setObjState] = useState<any>([]);

  useEffect(() => {
    setObjState(objValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objValue.value]);

  const save = (value: string | number | Date) => {
    onSaveCustomerInputInfo(value, `/${objState.name}`);
  };

  const onCloseDatePicker = (value: string | Date) => {
    const error = getErrorWhenChangeDOB(value, objState as IFieldValue);
    if (!error.isError && objState.isEditable) {
      save(value);
    }
    setObjState(error);
  };

  const handleSelectChange = ({ name, value }: IHandleSelectChange) => {
    let _value = value;
    // Handle fixed driver change to turn on DOB date fields
    if (name === 'fixedDriver') {
      _value = Number(_value);
      changeFixedDriver.next(_value);

      // Reset driver DOB fields
      if (_value === 0 && formValues.firstDriverDOB.value) {
        onSaveCustomerInputInfo('', `/firstDriverDOB`, 'remove');
      }
      if ((_value === 0 || _value === 1) && formValues.secondDriverDOB.value) {
        onSaveCustomerInputInfo('', `/secondDriverDOB`, 'remove');
      }
    }

    if (objState.isEditable) {
      save(_value);
    }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (objState.isEditable && !isFieldDisabled) {
      save(event.target.value);
    }
  };

  const radioGroupsProps = {
    name: objState.label,
    title: '',
    showLabel: false,
    row: true,
    dataTestId: `${objState.title}-radio-group`,
    value: objState.value,
    options: objState.options,
    handleChange: handleRadioChange,
    isDisabled: isFieldDisabled,
  };

  const render = useMemo(() => {
    const arrayFields = [
      {
        id: 0,
        value: <>{`: ${objState.value}`}</>,
      },
      {
        id: 1,
        value: (
          <InputData
            valueText={objState.value}
            isEditable={objState.isEditable && !isFieldDisabled}
            isError={objState.isError}
            error={objState.error}
            maxLength={40}
            name={objState.name}
            isNumeric={objState.isNumeric}
            handleOnBlur={onSaveCustomerInputInfo}
            handleOnEnter={onSaveCustomerInputInfo}
          />
        ),
      },
      {
        id: 2,
        value: (
          <RenderInputSelectItem
            initialValue={objState.value}
            handleUpdateOrder={handleSelectChange}
            placeholder={objState.placeholder}
            options={objState.options}
            name={objState.title}
            isDisabled={objState.disabled}
            isFieldsDisabled={!objState.isEditable || isFieldDisabled}
          />
        ),
      },
      {
        id: 3,
        value: (
          <RenderDOB
            onClose={onCloseDatePicker}
            value={objState.value}
            placeholder={getCustomerSectionTitle(objState.placeholder)}
            error={objState.error}
            name={objState.title}
            isFieldDisabled={isFieldDisabled || !objState.isEditable}
          />
        ),
      },
      {
        id: 4,
        value: (
          <div className={classes.radioGroup}>
            :&nbsp;
            <RadioGroupField {...radioGroupsProps} />
          </div>
        ),
      },
      {
        id: 5,
        value: <CopyToClipboard text={objState.value} />,
      },
      {
        id: 6,
        value: (
          <div className="flex">
            <span>:</span>
            <LabelWithIcon
              value={
                objState.value
                  ? getString('sundayContactable.allow')
                  : getString('sundayContactable.forbid')
              }
              name={objState.name}
              icon={
                objState.value ? (
                  <TickIcon fontSize="small" className="mr-4 ml-1" />
                ) : (
                  <CrossIcon
                    fontSize="small"
                    className="mr-4 ml-1"
                    width="20"
                    height="20"
                  />
                )
              }
              className="flex p-0 flex-row-reverse"
            />
          </div>
        ),
      },
    ];

    return arrayFields.find((item) => item.id === renderInputType(objState))
      ?.value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [{ ...objState }]);
  return <>{objState ? render : null}</>;
}

export default RenderValue;
