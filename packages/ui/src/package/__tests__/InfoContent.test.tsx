import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InfoSection from '../common/InfoSection';

const mockedPackageData = {
  hasData: true,
  key: 'key',
  title: 'title',
  items: [
    {
      label: 'label',
      values: {
        'packages/1355013': {
          component: <span>values</span>,
        },
      },
    },
  ],
  packages: ['packages/1355013'],
};

test('should render', () => {
  render(<InfoSection data={mockedPackageData} />);
  expect(screen.getByText('title')).toBeInTheDocument();
  expect(screen.getByText('label')).toBeInTheDocument();
  expect(screen.getByText('values')).toBeInTheDocument();
});
