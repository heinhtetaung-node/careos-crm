import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import PackageinfoTooltip from './PackageInfoTooltip';

test('should render correctly', () => {
  render(
    <PackageinfoTooltip
      name="name"
      expiryDate="2022-02-02"
      termsAndConditions="terms"
    />
  );
  expect(screen.getByText('leadDetailFields.packageName')).toBeInTheDocument();
  expect(screen.getByText('text.expiryDate')).toBeInTheDocument();
  expect(screen.getByText('text.termsAndConditions')).toBeInTheDocument();
});
