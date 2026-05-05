import { useFlags } from 'flagsmith/react';

import { mockUseFlags } from '.';

describe('Flagsmith mocks', () => {
  it('should mock the useFlags function with disabled flags', () => {
    mockUseFlags();
    const flags = useFlags(['flag_1', 'flag_2']);

    expect(flags.flag_1.enabled).toBeFalsy();
    expect(flags.flag_2.enabled).toBeFalsy();
  });

  it('should mock the useFlags function with enabled flags', () => {
    mockUseFlags(['flag_1']);
    const flags = useFlags(['flag_1', 'flag_2']);

    expect(flags.flag_1.enabled).toBeTruthy();
    expect(flags.flag_2.enabled).toBeFalsy();
  });
});
