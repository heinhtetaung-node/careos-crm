import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import { formatLicensePlateString, validateLicensePlate } from './helper';

import LicensePlate from '.';

const mockFn = jest.fn();

const initialProps = {
  name: 'carLicensePlate',
  title: 'License plate',
  dataTestId: 'license-plate-input',
  error: undefined,
  value: '',
  isReadOnly: false,
  isDisabled: false,
  showAsterisk: true,
  handleUpdate: mockFn,
};

const initialPropsWithData = {
  name: 'carLicensePlate',
  title: 'License plate',
  dataTestId: 'license-plate-input',
  error: undefined,
  value: {
    carLicensePlate: '1นน-1',
    redPlate: false,
  },
  abbreviation: 'กท',
  isReadOnly: false,
  isDisabled: false,
  showAsterisk: true,
  handleUpdate: mockFn,
};

describe('<LicensePlate Component/>', () => {
  beforeEach(() => {
    mockFn.mockClear();
  });

  it('renders the component correctly', async () => {
    render(<LicensePlate {...initialProps} />);
    const mainComponent = screen.getByTestId('license-plate-input');

    await waitFor(() => {
      expect(mainComponent).toBeInTheDocument();
    });
  });

  it('renders component and correctly displays license plate number', async () => {
    render(<LicensePlate {...initialPropsWithData} />);

    const freeTextLicensePlate = screen.getByTestId(
      'license-plate-input-freeText-input'
    ) as HTMLTextAreaElement;
    const numericalTextLicensePlate = screen.getByTestId(
      'license-plate-input-numericalText-input'
    ) as HTMLTextAreaElement;

    await waitFor(() => {
      expect(freeTextLicensePlate.value).toBe('1นน');
      expect(numericalTextLicensePlate.value).toBe('1');
    });
  });

  it('call save license when input changes', async () => {
    render(<LicensePlate {...initialPropsWithData} />);

    const freeTextLicensePlate = screen.getByTestId(
      'license-plate-input-freeText-input'
    ) as HTMLTextAreaElement;
    const numericalTextLicensePlate = screen.getByTestId(
      'license-plate-input-numericalText-input'
    ) as HTMLTextAreaElement;

    await userEvent.type(numericalTextLicensePlate, '23{enter}');

    await waitFor(() => {
      expect(freeTextLicensePlate.value).toBe('1นน');
      expect(numericalTextLicensePlate.value).toBe('123');
      expect(mockFn).toHaveBeenCalledWith({ carLicensePlate: '1นน-123 กท' });
    });
  });

  it('displays error when user enters wrong data to license plate input', async () => {
    render(<LicensePlate {...initialPropsWithData} />);

    const freeTextLicensePlate = screen.getByTestId(
      'license-plate-input-freeText-input'
    ) as HTMLTextAreaElement;
    const numericalTextLicensePlate = screen.getByTestId(
      'license-plate-input-numericalText-input'
    ) as HTMLTextAreaElement;

    await userEvent.clear(freeTextLicensePlate);
    await userEvent.clear(numericalTextLicensePlate);
    await userEvent.type(freeTextLicensePlate, 'a{enter}');

    await waitFor(() => {
      expect(freeTextLicensePlate.value).toBe('a');
      expect(numericalTextLicensePlate.value).toBe('');
      expect(screen.getByText('errors.licensePlate')).toBeInTheDocument();
    });
  });

  describe('backgroundColor prop', () => {
    it('applies white background styling when backgroundColor is provided', async () => {
      render(<LicensePlate {...initialPropsWithData} backgroundColor="#FFF" />);

      const freeTextInput = screen.getByTestId(
        'license-plate-input-freeText-input'
      ) as HTMLInputElement;
      const numericalTextInput = screen.getByTestId(
        'license-plate-input-numericalText-input'
      ) as HTMLInputElement;

      await waitFor(() => {
        expect(freeTextInput).toBeInTheDocument();
        expect(numericalTextInput).toBeInTheDocument();
      });

      // Check that the input elements have the correct classes for white background
      expect(freeTextInput).toHaveClass('bg-#FFF');
      expect(numericalTextInput).toHaveClass('bg-#FFF');
    });

    it('applies correct styling classes when backgroundColor is provided', async () => {
      render(<LicensePlate {...initialPropsWithData} backgroundColor="#FFF" />);

      const freeTextInput = screen.getByTestId(
        'license-plate-input-freeText-input'
      ) as HTMLInputElement;
      const numericalTextInput = screen.getByTestId(
        'license-plate-input-numericalText-input'
      ) as HTMLInputElement;

      await waitFor(() => {
        expect(freeTextInput).toBeInTheDocument();
        expect(numericalTextInput).toBeInTheDocument();
      });

      // Check for the specific styling classes that should be applied
      expect(freeTextInput).toHaveClass(
        'textfield-input',
        'w-[40px]',
        'bg-#FFF',
        'p-2',
        'border-[1px]',
        'border-solid',
        'rounded-[9px]',
        'border-[#e9edf5]',
        'focus:border-[1px]',
        'focus:border-[#005098]',
        'hover:border-[#005098]',
        'outline-none',
        'transition-all'
      );

      expect(numericalTextInput).toHaveClass(
        'textfield-input',
        'w-[44px]',
        'mr-0.5',
        'bg-#FFF',
        'p-2',
        'border-[1px]',
        'border-solid',
        'rounded-[9px]',
        'border-[#e9edf5]',
        'focus:border-[1px]',
        'focus:border-[#005098]',
        'hover:border-[#005098]',
        'outline-none',
        'transition-all'
      );
    });

    it('adds margin bottom to container when backgroundColor is provided', async () => {
      render(<LicensePlate {...initialPropsWithData} backgroundColor="#FFF" />);

      const container = screen
        .getByTestId('license-plate-input')
        .querySelector('.flex.items-center.justify-start.h-\\[100\\%\\]');

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });

      expect(container).toHaveClass('mb-1');
    });

    it('does not apply backgroundColor styling when backgroundColor is not provided', async () => {
      render(<LicensePlate {...initialPropsWithData} />);

      const freeTextInput = screen.getByTestId(
        'license-plate-input-freeText-input'
      ) as HTMLInputElement;
      const numericalTextInput = screen.getByTestId(
        'license-plate-input-numericalText-input'
      ) as HTMLInputElement;

      await waitFor(() => {
        expect(freeTextInput).toBeInTheDocument();
        expect(numericalTextInput).toBeInTheDocument();
      });

      // Should not have backgroundColor-related classes
      expect(freeTextInput).not.toHaveClass('bg-#FFF');
      expect(numericalTextInput).not.toHaveClass('bg-#FFF');
      expect(freeTextInput).not.toHaveClass(
        'p-2',
        'border-[1px]',
        'border-solid',
        'rounded-[9px]'
      );
      expect(numericalTextInput).not.toHaveClass(
        'p-2',
        'border-[1px]',
        'border-solid',
        'rounded-[9px]'
      );
    });

    it('does not add margin bottom to container when backgroundColor is not provided', async () => {
      render(<LicensePlate {...initialPropsWithData} />);

      const container = screen
        .getByTestId('license-plate-input')
        .querySelector('.flex.items-center.justify-start.h-\\[100\\%\\]');

      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });

      expect(container).not.toHaveClass('mb-1');
    });

    it('works correctly with different backgroundColor values', async () => {
      render(
        <LicensePlate {...initialPropsWithData} backgroundColor="#F0F0F0" />
      );

      const freeTextInput = screen.getByTestId(
        'license-plate-input-freeText-input'
      ) as HTMLInputElement;
      const numericalTextInput = screen.getByTestId(
        'license-plate-input-numericalText-input'
      ) as HTMLInputElement;

      await waitFor(() => {
        expect(freeTextInput).toBeInTheDocument();
        expect(numericalTextInput).toBeInTheDocument();
      });

      // Should have the custom backgroundColor class
      expect(freeTextInput).toHaveClass('bg-#F0F0F0');
      expect(numericalTextInput).toHaveClass('bg-#F0F0F0');
    });
  });
});

describe('formatLicensePlate', () => {
  const formattableLicensePlate = [
    {
      unformattedLicensePlate: '1กพ 123 กท',
      formattedLicensePlate: { freeText: '1กพ', numericalText: '123' },
    },
    {
      unformattedLicensePlate: '1กพ-123 กท',
      formattedLicensePlate: { freeText: '1กพ', numericalText: '123' },
    },
    {
      unformattedLicensePlate: '1กพ 123',
      formattedLicensePlate: { freeText: '1กพ', numericalText: '123' },
    },
    {
      unformattedLicensePlate: '1กพ-123',
      formattedLicensePlate: { freeText: '1กพ', numericalText: '123' },
    },
    {
      unformattedLicensePlate: '1กพ123',
      formattedLicensePlate: { freeText: '1กพ', numericalText: '123' },
    },
    {
      unformattedLicensePlate: '1ab123',
      formattedLicensePlate: { freeText: '1ab', numericalText: '123' },
    },
    {
      unformattedLicensePlate: '1ก3-123 กท',
      formattedLicensePlate: { freeText: '1ก3', numericalText: '123' },
    },
    {
      unformattedLicensePlate: '1ก3-123',
      formattedLicensePlate: { freeText: '1ก3', numericalText: '123' },
    },
    {
      unformattedLicensePlate: '1-234',
      formattedLicensePlate: { freeText: '1', numericalText: '234' },
    },
    {
      unformattedLicensePlate: '1-234 กท',
      formattedLicensePlate: { freeText: '1', numericalText: '234' },
    },
    {
      unformattedLicensePlate: '1234 กท',
      formattedLicensePlate: { freeText: '123', numericalText: '4' },
    },
    {
      unformattedLicensePlate: '1ก3-123',
      formattedLicensePlate: { freeText: '1ก3', numericalText: '123' },
    },
    {
      unformattedLicensePlate: '123-4567 กท',
      formattedLicensePlate: { freeText: '123', numericalText: '4567' },
    },
    {
      unformattedLicensePlate: '1234567 กท',
      formattedLicensePlate: { freeText: '123', numericalText: '4567' },
    },
  ];

  formattableLicensePlate.forEach((licensePlate) => {
    it(`returns license plate(${licensePlate.unformattedLicensePlate}) in correct format(${licensePlate.formattedLicensePlate})`, () => {
      const formattedLicensePlate = formatLicensePlateString(
        licensePlate.unformattedLicensePlate,
        'กท'
      );
      expect(formattedLicensePlate).toEqual(licensePlate.formattedLicensePlate);
    });
  });
});

describe('validateLicensePlate', () => {
  const validLicensePlate = ['1กพ', 'ก1พ', '123', 'กพก'];

  validLicensePlate.forEach((licensePlate: string) => {
    it(`returns true to valid license plate ${licensePlate}`, () => {
      const isValidLicensePlate = validateLicensePlate(licensePlate);
      expect(isValidLicensePlate).toBeTruthy();
    });
  });

  const invalidLicensePlate = ['n1พ', '1ab', 'abc'];

  invalidLicensePlate.forEach((licensePlate: string) => {
    it(`returns false to invalid license plate ${licensePlate}`, () => {
      const isValidLicensePlate = validateLicensePlate(licensePlate);
      expect(isValidLicensePlate).toBeFalsy();
    });
  });
});
