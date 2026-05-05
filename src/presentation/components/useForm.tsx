import { makeStyles } from '@material-ui/core';
import React, { useState } from 'react';

export function useForm(
  initialFValues: any,
  validateOnChange = false,
  validate: any
) {
  const [values, setValues] = useState(initialFValues);
  const [errors, setErrors]: any = useState({});

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const resetForm = () => {
    setValues(initialFValues);
    setErrors({});
  };

  return {
    values,
    setValues,
    errors,
    setErrors,
    handleInputChange,
    resetForm,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiFormControl-root': {
      width: '80%',
      margin: theme.spacing(1),
    },
  },
}));

export function Form(props: any) {
  const classes = useStyles();
  const { children } = props;
  return (
    <form className={classes.root} autoComplete="off">
      {children}
    </form>
  );
}
