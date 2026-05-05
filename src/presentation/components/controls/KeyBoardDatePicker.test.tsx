import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { render } from '@testing-library/react';
import React from 'react';

import KeyBoardDatePicker from './KeyBoardDatePicker';

const initialProps = {
  name: 'KeyBoardDatePicker',
  label: 'KeyBoardDatePicker',
  value: '',
  className: '',
  onChange: () => null,
  invalidDateMessage: false,
  minDateMessage: false,
  autoOk: true,
  disableToolbar: true,
  fixedLabel: true,
};

function Component() {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyBoardDatePicker {...initialProps} />
    </MuiPickersUtilsProvider>
  );
}

describe('<KeyBoardDatePicker />', () => {
  it('Render', () => {
    const { getByText } = render(<Component />);
    expect(getByText('KeyBoardDatePicker')).toBeTruthy();
  });
});
