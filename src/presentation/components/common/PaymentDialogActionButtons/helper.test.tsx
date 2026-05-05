import { ReactElement } from 'react';

import { addLink } from './helper';

describe('addLink', () => {
  it('returns the correct format', () => {
    const result = addLink(
      'Hey https://www.google.com!',
      'https://www.google.com'
    );
    const expectedTexts = ['Hey ', 'https://www.google.com ', '!'];
    result.props.children.forEach((child: ReactElement, key: number) => {
      expect(child.props.children).toEqual(expectedTexts[key]);
    });
  });
});
