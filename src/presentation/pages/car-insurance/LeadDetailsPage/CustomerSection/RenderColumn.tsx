import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

import { EDIT_TYPE, getClassFieldItem } from './helper';
import RenderValue from './RenderValue';

import SearchFileIcon from '../../../../../images/icons/searchfile.svg';
import { getCustomerSectionTitle } from '../leadDetailsPage.helper';

const useStyles = makeStyles((theme) => ({
  field: {
    display: 'flex',
    padding: '10px 15px',
    alignItems: 'flex-start',
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  fieldItem: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
  },
}));

function RenderColumn({
  item,
  onSaveCustomerInputInfo,
  isFieldDisabled = false,
  isPolicyInfo = false,
  isHealth = false,
}: any) {
  const classes = useStyles();
  const renderIcon = (editType: EDIT_TYPE) => {
    if (editType === EDIT_TYPE.DATE) {
      return <img src={SearchFileIcon} alt="" />;
    }
    return null;
  };

  return (
    <>
      {Object.entries(item).map(([key, keyValue]: [string, any]) => {
        if (
          isPolicyInfo &&
          ['policyDOB', 'policyAge', 'customerDOB', 'customerAge'].includes(
            keyValue.name
          )
        ) {
          return null;
        }
        return (
          <div
            className={clsx(classes.field, 'items-center')}
            key={keyValue.id}
            id={keyValue.name}
          >
            <span
              className={clsx(
                getClassFieldItem(keyValue, isFieldDisabled),
                'include-asterisk',
                classes.fieldItem
              )}
            >
              {getCustomerSectionTitle(keyValue.title)}
              {keyValue.isRequired && <span className="asterisk">*</span>}
            </span>
            {isHealth ? (
              <RenderValue
                objValue={keyValue}
                onSaveCustomerInputInfo={onSaveCustomerInputInfo}
                formValues={item}
                isFieldDisabled={isFieldDisabled}
              />
            ) : (
              <div className="field-item">
                <RenderValue
                  objValue={keyValue}
                  onSaveCustomerInputInfo={onSaveCustomerInputInfo}
                  formValues={item}
                  isFieldDisabled={isFieldDisabled}
                />
                {renderIcon(keyValue.editType)}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default RenderColumn;
