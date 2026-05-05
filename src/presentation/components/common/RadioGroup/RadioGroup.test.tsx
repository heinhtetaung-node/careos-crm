import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';

import maTheme from '../../../theme';

import RadioGroup, { Option } from './RadioGroup';

const baseTheme = maTheme[0];

function renderGroup(
  ui: React.ReactElement,
  theme: typeof baseTheme = baseTheme
) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const options: Option[] = [
  {
    value: 'option1',
    label: 'Option1',
  },
  {
    value: 'option2',
    label: 'Option2',
    status: 'danger',
  },
  {
    value: 'option3',
    disabled: true,
    label: 'Option3',
  },
];

describe('Test <RadioGroup/>', () => {
  it('<RadioGroup/> render correctly', () => {
    renderGroup(
      <RadioGroup data-testid="common-radio-group" options={options} />
    );
    expect(screen.getByTestId('common-radio-group')).toBeInTheDocument();
  });

  it('<RadioGroup/> render correct number of options', () => {
    renderGroup(<RadioGroup options={options} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  it('renders no radios when options is empty', () => {
    renderGroup(<RadioGroup options={[]} value="x" />);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('renders no radios when options is undefined', () => {
    renderGroup(
      <RadioGroup options={undefined as unknown as Option[]} value="x" />
    );
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('calls onChange when a different option is selected', () => {
    const onChange = jest.fn();
    renderGroup(
      <RadioGroup
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        value="a"
        onChange={onChange}
      />
    );
    screen.getByRole('radio', { name: 'B' }).click();
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][1]).toBe('b');
  });

  it('renders without onChange without throwing when selecting', () => {
    renderGroup(
      <RadioGroup options={[{ value: 'only', label: 'Only' }]} value="only" />
    );
    expect(() =>
      screen.getByRole('radio', { name: 'Only' }).click()
    ).not.toThrow();
  });

  it('disables labels when isDisabled is true', () => {
    renderGroup(
      <RadioGroup options={[{ value: 'x', label: 'X' }]} value="x" isDisabled />
    );
    expect(screen.getByRole('radio', { name: 'X' })).toBeDisabled();
  });

  it('syncs checked state when value prop changes', () => {
    const onChange = jest.fn();
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];
    const { rerender } = renderGroup(
      <RadioGroup options={opts} value="a" onChange={onChange} />
    );
    expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
    rerender(
      <ThemeProvider theme={baseTheme}>
        <RadioGroup options={opts} value="b" onChange={onChange} />
      </ThemeProvider>
    );
    expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
  });

  it('applies palette.danger.main when theme defines it', () => {
    const dangerTheme = createMuiTheme({
      palette: {
        ...baseTheme.palette,
        danger: { main: '#b71c1c' },
      },
    } as unknown as import('@material-ui/core').ThemeOptions);

    renderGroup(
      <RadioGroup
        options={[{ value: 'd', label: 'DangerOpt', status: 'danger' }]}
        value="d"
      />,
      dangerTheme
    );
    expect(
      screen.getByRole('radio', { name: 'DangerOpt' })
    ).toBeInTheDocument();
  });
});
