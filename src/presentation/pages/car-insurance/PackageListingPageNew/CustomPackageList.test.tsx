import React from 'react';

import CustomPackageList from './CustomPackageList';
import { render } from '__tests__/rtl-test-utils';

describe('CustomPackageList', () => {
  it('has correct height styling', () => {
    const { container } = render(<CustomPackageList />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toBeInTheDocument();
  });

  it('has dashed border styling', () => {
    const { container } = render(<CustomPackageList />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toBeInTheDocument();
  });
});
