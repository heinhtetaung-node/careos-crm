import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import SkeletonRow from '.';

describe('<SkeletonRow />', () => {
  it('should render component correctly', async () => {
    render(<SkeletonRow rows={7} />);
    expect(screen.getByTestId('skeletonRow-container')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton-rows').length).toBe(7);
  });
});
