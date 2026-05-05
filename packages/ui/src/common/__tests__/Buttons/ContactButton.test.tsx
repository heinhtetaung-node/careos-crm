import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import ContactButton from '../../Buttons/ContactButton';

describe('ContactButton component', () => {
  const altText = 'image';
  it('should render with the correct props', () => {
    render(<ContactButton href="href" imagePath="image" altText={altText} />);

    expect(screen.getByAltText(altText)).toBeInTheDocument();
    expect(screen.getByAltText(altText)).toHaveAttribute('src', 'image');
    expect(screen.getByAltText(altText).parentElement).toHaveAttribute(
      'href',
      'href'
    );
  });

  it('should override conflicting classnames', () => {
    render(
      <ContactButton
        href="href"
        imagePath="image"
        className="bg-secondary border-secondary"
        altText={altText}
      />
    );

    expect(screen.getByAltText(altText)).toBeInTheDocument();
    expect(screen.getByAltText(altText).parentElement).toHaveClass(
      'bg-secondary border-secondary'
    );
    expect(screen.getByAltText(altText).parentElement).not.toHaveClass(
      'bg-primary border-primary'
    );
  });
});
