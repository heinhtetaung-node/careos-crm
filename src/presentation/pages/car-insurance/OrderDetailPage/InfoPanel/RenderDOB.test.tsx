import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import RenderDOB from './RenderDOB';

function wrapComponent(component: JSX.Element) {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      {component}
    </MuiPickersUtilsProvider>
  );
}

describe('<RenderDOB/>', () => {
  it('will be mounted correctly', () => {
    render(wrapComponent(<RenderDOB onClose={jest.fn()} value={new Date()} />));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('Button edit icon exists', () => {
    render(wrapComponent(<RenderDOB onClose={jest.fn()} value={new Date()} />));
    expect(screen.getByTestId('pen-icon')).toBeInTheDocument();
  });

  it('Displays the date passed', async () => {
    render(
      wrapComponent(
        <RenderDOB
          onClose={jest.fn()}
          value={new Date(1990, 0, 1)}
          name="dob"
        />
      )
    );
    const dob = screen.getByRole('textbox') as HTMLInputElement;
    expect(dob).toHaveValue('01/01/1990');
  });
});
