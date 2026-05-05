import React from 'react';
import { render, screen } from '__tests__/rtl-test-utils';
import FlashInfo from './FlashInfo';

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));
describe('FlashInfo', () => {
  it('renders without crashing', () => {
    render(<FlashInfo />);
    expect(screen.getByText('packageListing.flashInfo')).toBeInTheDocument();
  });

  it('renders the flash info header with correct styling', () => {
    render(<FlashInfo />);

    const headerElement = screen.getByText('packageListing.flashInfo');
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveClass('text-primary', 'font-bold');

    const headerContainer = headerElement.parentElement;
    expect(headerContainer).toHaveClass(
      'bg-[#E9EDF5]',
      'px-6',
      'py-4',
      'text-left'
    );
  });

  it('renders all three banner images', () => {
    render(<FlashInfo />);

    const bannerImages = screen.getAllByRole('img');
    expect(bannerImages).toHaveLength(3);

    // Check first banner
    expect(bannerImages[0]).toHaveAttribute(
      'src',
      '/static/img/banners/banner1.jpg'
    );
    expect(bannerImages[0]).toHaveAttribute('alt', 'Promotion Banner 1');
    expect(bannerImages[0]).toHaveClass('w-full');

    // Check second banner
    expect(bannerImages[1]).toHaveAttribute(
      'src',
      '/static/img/banners/banner2.jpg'
    );
    expect(bannerImages[1]).toHaveAttribute('alt', 'Promotion Banner 2');
    expect(bannerImages[1]).toHaveClass('w-full');

    // Check third banner
    expect(bannerImages[2]).toHaveAttribute(
      'src',
      '/static/img/banners/banner3.jpg'
    );
    expect(bannerImages[2]).toHaveAttribute('alt', 'Promotion Banner 3');
    expect(bannerImages[2]).toHaveClass('w-full');
  });

  it('has correct container structure', () => {
    const { container } = render(<FlashInfo />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'gap-2');

    // Check header container
    const headerContainer = mainContainer.children[0] as HTMLElement;
    expect(headerContainer).toHaveClass(
      'bg-[#E9EDF5]',
      'px-6',
      'py-4',
      'text-left'
    );

    // Check images container
    const imagesContainer = mainContainer.children[1] as HTMLElement;
    expect(imagesContainer).toBeDefined();
  });

  it('renders images in correct order', () => {
    const { container } = render(<FlashInfo />);

    const imagesContainer = container.firstChild?.children[1] as HTMLElement;
    const images = imagesContainer.children;

    expect(images).toHaveLength(3);

    // Verify image order
    expect(images[0]).toHaveAttribute('src', '/static/img/banners/banner1.jpg');
    expect(images[1]).toHaveAttribute('src', '/static/img/banners/banner2.jpg');
    expect(images[2]).toHaveAttribute('src', '/static/img/banners/banner3.jpg');
  });
});
