import { FormControl, Input, InputLabel, Typography } from '@material-ui/core';
import React, { Fragment } from 'react';

import { KratosFormConfig } from 'data/slices/authSlice';
import { getString } from 'presentation/theme/localization';
import SessionStorage, {
  SESSION_STORAGE_KEY,
} from 'shared/helper/SessionStorage';

import Button from '../../Button';
import './index.scss';

export interface KratosField {
  name: string;
  type: string;
  required: boolean;
  value?: string;
  messages?: any[];
}

interface IFormProps {
  config: KratosFormConfig;
  isFetching: boolean;
}
const sessionStorage = new SessionStorage();
const Form: React.FC<IFormProps> = ({ config, isFetching }) => {
  const isSuspend =
    sessionStorage.getItemByKey(SESSION_STORAGE_KEY.SUSPEND) === 'true';

  const getInputLabel = (fieldName: string) => {
    const labelMapping: { [key: string]: string } = {
      identifier: 'Username',
      password: 'Password',
    };

    return labelMapping[fieldName];
  };

  const handleErrorMessage = (message: string) => {
    return (
      <Typography variant="caption" color="error">
        {message}
      </Typography>
    );
  };
  return (
    <form
      method={config.method}
      action={config.action}
      className="c-signin-frm"
    >
      {config.fields.map((field: KratosField) => (
        <Fragment key={field.name}>
          {field.name === 'csrf_token' ? (
            <input
              id={field.name}
              name={field.name}
              autoComplete={field.name}
              required={field.required}
              value={field.value}
              type={field.type}
            />
          ) : (
            <FormControl margin="normal" required fullWidth>
              {field.type !== 'hidden' ? (
                <InputLabel htmlFor={field.name}>
                  {getInputLabel(field.name)}
                </InputLabel>
              ) : (
                ''
              )}
              <Input
                id={field.name}
                name={field.name}
                autoComplete={field.name}
                required={field.required}
                type={field.type}
                disableUnderline
              />
            </FormControl>
          )}
        </Fragment>
      ))}

      {config.messages?.length
        ? handleErrorMessage(config.messages[0].text || '')
        : isSuspend && handleErrorMessage(getString('text.suspendAccount'))}
      <Button
        fullWidth
        type="submit"
        variant="contained"
        color="primary"
        className="btn-submit cypress-btn-login"
        disabled={isFetching}
      >
        {getString('text.signIn')}
      </Button>
    </form>
  );
};

export default Form;
