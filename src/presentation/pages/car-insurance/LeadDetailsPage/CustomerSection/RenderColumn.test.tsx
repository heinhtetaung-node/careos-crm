import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import RenderColumn from './RenderColumn';

const item = {
  firstName: {
    value: 'John',
    title: 'firstName',
  },
  DOB: {
    value: '12/12/12',
    title: 'dob',
    name: 'customerDOB',
  },
  Age: {
    value: '0',
    title: 'age',
    name: 'customerAge',
  },
};

describe('<RenderColumn/>', () => {
  it('will be mounted correctly', () => {
    render(<RenderColumn item={item} />);
    expect(screen.getByText('leadDetailFields.firstName')).toBeInTheDocument();
  });
  it('should show edit icon', () => {
    const updatedItem = {
      ...item,
      DOB: {
        ...item.DOB,
        editType: 'date',
      },
    };
    render(<RenderColumn item={updatedItem} isPolicyInfo={false} />);
    expect(
      screen.getByText('leadDetailFields.dob').nextElementSibling
        ?.lastElementChild?.nodeName
    ).toBe('IMG');
  });
  it('should display age and DOB field if placeholderInfo is not there', () => {
    render(<RenderColumn item={item} isPolicyInfo={false} />);
    expect(screen.getByText('leadDetailFields.dob')).toBeInTheDocument();
    expect(screen.getByText('leadDetailFields.age')).toBeInTheDocument();
  });
  it('should not display age and DOB field if placeholderInfo is there', () => {
    render(<RenderColumn item={item} isPolicyInfo />);
    expect(
      screen.getByText('leadDetailFields.firstName').parentElement
        ?.parentElement?.childElementCount
    ).toBe(1);
  });
});
