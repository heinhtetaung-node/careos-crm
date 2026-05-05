import { render, screen } from '@testing-library/react';
import React from 'react';

import RenderInputSelectItem from './RenderInputSelectItem';

import { getOptionData } from '../leadDetailsPage.helper';

describe('<RenderInputSelectItem />', () => {
  it('test with isFieldDisabled flag for non Fender value', () => {
    render(
      <RenderInputSelectItem
        initialValue="initialvalue"
        name="non-gender"
        handleUpdateOrder={jest.fn()}
        options={getOptionData('Gender')}
        isFieldsDisabled
      />
    );
    expect(screen.getByText(': initialvalue')).toBeInTheDocument();
  });
  it('test with isFieldDisabled flag for Gender female', () => {
    render(
      <RenderInputSelectItem
        initialValue="f"
        name="gender"
        handleUpdateOrder={jest.fn()}
        options={getOptionData('Gender')}
        isDisabled
      />
    );
    expect(screen.getByText('text.female')).toBeInTheDocument();
  });
  it('test with isFieldDisabled flag for Gender male', () => {
    render(
      <RenderInputSelectItem
        initialValue="m"
        name="gender"
        handleUpdateOrder={jest.fn()}
        options={getOptionData('Gender')}
        isDisabled
      />
    );
    expect(screen.getByText('text.male')).toBeInTheDocument();
  });
});
