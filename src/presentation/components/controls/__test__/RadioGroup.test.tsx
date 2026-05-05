import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { localeOptions } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';

import RadioGroup from '../RadioGroup';

const handleChange = jest.fn();
test('RadioGroup renders ', () => {
  render(
    <RadioGroup
      name="test"
      label="test"
      value=""
      onChange={handleChange}
      items={localeOptions}
    />
  );
  expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  expect(screen.getAllByRole('radio')).toHaveLength(2);
});
