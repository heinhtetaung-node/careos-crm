import {
  makeStyles,
  createStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
} from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import * as React from 'react';

import Autocomplete from '../Autocomplete';
import Datepicker from '../Datepicker';

import { IDialogProps } from '.';

interface MockFormProps {
  setDialogProps?: React.Dispatch<
    React.SetStateAction<
      Omit<IDialogProps, 'content' | 'handleToggle'> | undefined
    >
  >;
  onSubmit: (payload: any) => void;
  formId: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    fieldSpace: {
      width: '100%',
      marginTop: '15px',
    },
  })
);

function MockForm({ setDialogProps, onSubmit, formId }: MockFormProps) {
  const [age, setAge] = React.useState('');
  const [role, setRole] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [date, setDate] = React.useState<Date | undefined>();

  const autoCompleteOptions = [
    'Motor Insurance',
    'Health Insurance',
    'Travel Insurance',
    'Life Insurance',
    'Credit Card Insurance',
  ];

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAge(event.target.value as string);
  };

  const handleTextfieldChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setComment(event.target.value as string);
  };

  const handleDialogProps = (
    props: Omit<IDialogProps, 'content' | 'handleToggle'>
  ) => {
    if (setDialogProps) {
      setDialogProps(props);
    }
  };

  const handleSubmitData = (event: any) => {
    event.preventDefault();
    onSubmit({
      age,
      role,
      comment,
    });
  };

  const classes = useStyles();

  React.useEffect(() => {
    if (role === '') return;
    const isRoleMyself = role === 'me';
    const dialogProps = {
      title: isRoleMyself ? 'Update data' : 'Report issue',
      buttonText: isRoleMyself ? 'Update' : 'Report issue',
    };
    handleDialogProps(dialogProps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmitData}
      data-testid="default-mockform"
    >
      <RadioGroup row aria-label="position" name="position" defaultValue="top">
        <FormControlLabel
          value="me"
          control={<Radio color="primary" />}
          label="Update data myself"
          onChange={() => setRole('me')}
        />
        <FormControlLabel
          value="sale"
          control={<Radio color="secondary" />}
          label="Sales has to update"
          onChange={() => setRole('sale')}
        />
      </RadioGroup>
      <Typography>Lorem ipsum dolor sit amet, consectetur</Typography>
      <Select
        labelId="demo-simple-select-outlined-label"
        id="demo-simple-select-outlined"
        value={age}
        onChange={handleSelectChange}
        label="Select"
        className={classes.fieldSpace}
      >
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>
      <Autocomplete
        multiple
        options={autoCompleteOptions}
        className={classes.fieldSpace}
        defaultValue={[autoCompleteOptions[0], autoCompleteOptions[1]]}
      />
      <Box className={classes.fieldSpace}>
        <Datepicker
          dateValue={date}
          textFieldProps={{ label: 'Date Picker' }}
          onChange={setDate}
        />
      </Box>
      <TextField
        id="outlined-multiline-static"
        label="Comment"
        multiline
        minRows={4}
        variant="outlined"
        onChange={handleTextfieldChange}
        className={classes.fieldSpace}
      />
    </form>
  );
}

export default MockForm;
