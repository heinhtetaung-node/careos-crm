import user from '@testing-library/user-event';
import React from 'react';
import { render, screen } from '__tests__/rtl-test-utils';
import CommonCheckBox from './CommonCheckBox';

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => {
    switch (key) {
      case 'text.selectAll':
        return 'Select All';
      case 'text.clearAll':
        return 'Clear All';
      default:
        return key;
    }
  }),
}));

const commonProps = {
  title: 'Test Checkbox',
  tooltipText: 'Test Tooltip',
  checkboxArr: [
    { key: '1', label: 'checkbox 1' },
    { key: '2', label: 'checkbox 2' },
  ],
  onChange: jest.fn(),
};

describe('<CommonCheckBox />', () => {
  test('should display all checkbox', () => {
    render(
      <CommonCheckBox
        {...commonProps}
        checkedArr={[]}
        setCheckedArr={jest.fn()}
      />
    );
    expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
    expect(screen.getByText('checkbox 1')).toBeInTheDocument();
    expect(screen.getByText('checkbox 2')).toBeInTheDocument();
  });

  test('should check if pased checkedArr', () => {
    render(
      <CommonCheckBox
        {...commonProps}
        checkedArr={['1']}
        setCheckedArr={jest.fn()}
      />
    );
    expect(screen.getByRole('checkbox', { name: 'checkbox 1' })).toHaveProperty(
      'checked',
      true
    );
    expect(screen.getByRole('checkbox', { name: 'checkbox 2' })).toHaveProperty(
      'checked',
      false
    );
  });

  test('should call setCheckedArr if clicked', async () => {
    const mockeFn = jest.fn();
    render(
      <CommonCheckBox
        {...commonProps}
        checkedArr={[]}
        setCheckedArr={mockeFn}
      />
    );
    await user.click(screen.getByRole('checkbox', { name: 'checkbox 1' }));
    expect(mockeFn).toHaveBeenCalledWith(['1']);
  });

  test('should unselect if already checked', async () => {
    const mockeFn = jest.fn();
    render(
      <CommonCheckBox
        {...commonProps}
        checkedArr={['1']}
        setCheckedArr={mockeFn}
      />
    );
    await user.click(screen.getByRole('checkbox', { name: 'checkbox 1' }));
    expect(mockeFn).toHaveBeenCalledWith([]);
  });

  test('should select all', async () => {
    const mockeFn = jest.fn();
    render(
      <CommonCheckBox
        {...commonProps}
        checkedArr={[]}
        setCheckedArr={mockeFn}
      />
    );
    await user.click(screen.getByText('Select All'));
    expect(mockeFn).toHaveBeenCalledWith(['1', '2']);
  });

  test('should unselect all', async () => {
    const mockeFn = jest.fn();
    render(
      <CommonCheckBox
        {...commonProps}
        checkedArr={['1', '2']}
        setCheckedArr={mockeFn}
      />
    );
    await user.click(screen.getByText('Clear All'));
    expect(mockeFn).toHaveBeenCalledWith([]);
  });

  test('should pass empty title to TitleRegion when titleLeft is true (covers line 90)', () => {
    render(
      <CommonCheckBox
        {...commonProps}
        checkedArr={[]}
        setCheckedArr={jest.fn()}
        titleLeft={true}
      />
    );

    // When titleLeft is true, the TitleRegion should receive an empty title
    // We can verify this by checking that the title is not displayed in the TitleRegion
    // but is displayed in the left section instead
    const titleElements = screen.getAllByText('Test Checkbox');
    expect(titleElements).toHaveLength(1); // Only one instance (in the left section)
  });

  test('should pass title to TitleRegion when titleLeft is false (covers line 90)', () => {
    render(
      <CommonCheckBox
        {...commonProps}
        checkedArr={[]}
        setCheckedArr={jest.fn()}
        titleLeft={false}
      />
    );

    // When titleLeft is false, the TitleRegion should receive the actual title
    // We can verify this by checking that the title is displayed in the TitleRegion
    // and not in the left section
    const titleElements = screen.getAllByText('Test Checkbox');
    expect(titleElements).toHaveLength(1); // Only one instance (in the TitleRegion)

    // The title should not have the left section styling
    const titleElement = screen.getByText('Test Checkbox');
    expect(titleElement).not.toHaveClass(
      'text-primary',
      'font-bold',
      'text-xs',
      'mt-0.5'
    );
  });

  test('should render title in left section when titleLeft is true (covers line 107)', () => {
    render(
      <CommonCheckBox
        {...commonProps}
        checkedArr={[]}
        setCheckedArr={jest.fn()}
        titleLeft={true}
      />
    );

    // The title should be rendered in the left section
    expect(screen.getByText('Test Checkbox')).toBeInTheDocument();

    // Verify the title is in the left section with correct styling
    const titleElement = screen.getByText('Test Checkbox');
    expect(titleElement).toHaveClass(
      'text-primary',
      'font-bold',
      'text-xs',
      'mt-0.5'
    );
  });

  test('should not render title in left section when titleLeft is false (covers line 107)', () => {
    render(
      <CommonCheckBox
        {...commonProps}
        checkedArr={[]}
        setCheckedArr={jest.fn()}
        titleLeft={false}
      />
    );

    // The title should still be in the document (from TitleRegion)
    expect(screen.getByText('Test Checkbox')).toBeInTheDocument();

    // But it should not have the left section styling
    const titleElement = screen.getByText('Test Checkbox');
    expect(titleElement).not.toHaveClass(
      'text-primary',
      'font-bold',
      'text-xs',
      'mt-0.5'
    );
  });
});
