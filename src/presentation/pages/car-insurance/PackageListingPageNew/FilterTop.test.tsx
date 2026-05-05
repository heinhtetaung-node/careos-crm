import React from 'react';
import { render, screen, fireEvent } from '__tests__/rtl-test-utils';
import FilterTop from './FilterTop';
import {
  mockFilterTopProps,
  mockFilterTopPropsWithCallbacks,
  mockFilterTopPropsWithState,
} from 'mock-data/FilterTop.mock';

const renderFilterTop = (props = {}) => {
  const defaultProps = {
    ...mockFilterTopProps,
    ...props,
  };
  return render(<FilterTop {...defaultProps} />);
};
jest.mock('presentation/theme/localization', () => {
  const map: Record<string, string> = {
    'leadPackageFilter.price': 'Price',
    'leadPackageFilter.insuranceType': 'Insurance Type',
    'leadPackageFilter.repairType': 'Repair Type',
    'leadPackageFilter.deductible': 'Deductible',
    'leadPackageFilter.insurer': 'Insurer',

    'leadPackageFilter.possibleValue.insuranceType.type1': 'Type 1',
    'leadPackageFilter.possibleValue.insuranceType.type2+': 'Type 2+',
    'leadPackageFilter.possibleValue.insuranceType.type2': 'Type 2',
    'leadPackageFilter.possibleValue.insuranceType.type3+': 'Type 3+',
    'leadPackageFilter.possibleValue.insuranceType.type3': 'Type 3',
    'leadPackageFilter.possibleValue.insuranceType.compulsory': 'Compulsory',

    'leadPackageFilter.possibleValue.repairType.garage': 'Garage',
    'leadPackageFilter.possibleValue.repairType.dealer': 'Dealer',

    'leadPackageFilter.possibleValue.deductible.noDeductible': 'No Deductible',
    'leadPackageFilter.possibleValue.deductible.onlyDeductible':
      'Only Deductible',
  };
  return { getString: (k: string) => map[k] ?? k };
});

jest.mock(
  './PackageFilter/controls/CommonSlider',
  () =>
    function MockCommonSlider(props: any) {
      const { title, sliderRange, setSliderRange, minVal, maxVal, onChange } =
        props;
      return (
        <div data-testid="mock-slider">
          <span>{title}</span>
          <output data-testid="slider-range">
            {`${sliderRange[0]}-${sliderRange[1]}`}
          </output>
          <button
            type="button"
            onClick={() => setSliderRange([minVal, maxVal])}
          >
            set to bounds
          </button>
          <button
            type="button"
            data-testid="trigger-onchange"
            onClick={() => onChange && onChange()}
          >
            trigger onChange
          </button>
        </div>
      );
    }
);

jest.mock(
  './PackageFilter/controls/CommonCheckBox',
  () =>
    function MockCommonCheckBox(props: any) {
      const { title, checkboxArr, checkedArr, setCheckedArr } = props;

      const toggle = (key: string) => {
        const newCheckedArr = checkedArr.includes(key)
          ? checkedArr.filter((k: string) => k !== key)
          : [...checkedArr, key];
        setCheckedArr(newCheckedArr);
      };

      return (
        <fieldset data-testid={`mock-checkbox-${title}`}>
          <legend>{title}</legend>
          {checkboxArr.map((o: any) => {
            const id = `cb-${title}-${o.key}`;
            return (
              <div key={o.key}>
                <input
                  id={id}
                  type="checkbox"
                  aria-label={o.label}
                  checked={checkedArr.includes(o.key)}
                  onChange={() => toggle(o.key)}
                />
                <label htmlFor={id}>{o.label}</label>{' '}
              </div>
            );
          })}
        </fieldset>
      );
    }
);

describe('FilterTop', () => {
  it('renders without crashing', () => {
    renderFilterTop();
  });

  it('has correct container styling', () => {
    const { container } = renderFilterTop();
    const main = container.firstChild as HTMLElement;

    expect(main).toBeInTheDocument();
  });

  it('renders CommonCheckBox sections with expected titles', () => {
    renderFilterTop();

    expect(screen.getByText('Insurance Type')).toBeInTheDocument();
    expect(screen.getByText('Repair Type')).toBeInTheDocument();
    expect(screen.getByText('Deductible')).toBeInTheDocument();
  });

  it('renders insurer logos (via alt text) for all insurers', () => {
    renderFilterTop();
    const insurers = [
      'Bangkok Insurance',
      'Viriyah Insurance',
      'Thanachart Insurance',
      'Tokio Marine Safety Insurance',
      'ERGO Insurance',
      'Southeast Insurance',
      'Dhipaya Insurance',
      'AXA Insurance',
      'LMG Insurance',
      'Muang Thai Insurance',
      'Navakij Insurance',
      'MSIG Insurance',
      'Thaivivat Insurance',
    ];

    insurers.forEach((label) => {
      expect(screen.getByAltText(label)).toBeInTheDocument();
    });
  });

  it('toggles insurer selection', () => {
    let selectedInsurers: string[] = [];
    const onSelectedInsurersChange = jest.fn((insurers: string[]) => {
      selectedInsurers = insurers;
    });
    const { rerender } = renderFilterTop({
      selectedInsurers,
      onSelectedInsurersChange,
    });
    const btn = screen.getByRole('button', { name: /Bangkok Insurance/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    expect(onSelectedInsurersChange).toHaveBeenCalledWith(['insurers/7']);
    rerender(
      <FilterTop
        {...mockFilterTopPropsWithState({
          selectedInsurers: ['insurers/7'],
          onSelectedInsurersChange,
        })}
      />
    );
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    expect(onSelectedInsurersChange).toHaveBeenCalledWith([]);
  });
  it('updates the slider range when the mock slider triggers setSliderRange', () => {
    renderFilterTop();
    const out = screen.getByTestId('slider-range');
    expect(out).toHaveTextContent('0-1000000');

    fireEvent.click(screen.getByText('set to bounds'));
    expect(out).toHaveTextContent('0-10000');
  });
  it('checks and unchecks insurance type values', () => {
    let insuranceTypes: string[] = [];
    const onInsuranceTypesChange = jest.fn((types: string[]) => {
      insuranceTypes = types;
    });
    const { rerender } = renderFilterTop({
      insuranceTypes,
      onInsuranceTypesChange,
    });
    const cbType1 = screen.getByLabelText('Type 1') as HTMLInputElement;
    const cbType3 = screen.getByLabelText('Type 3') as HTMLInputElement;
    expect(cbType1.checked).toBe(false);
    expect(cbType3.checked).toBe(false);
    fireEvent.click(cbType1);
    expect(onInsuranceTypesChange).toHaveBeenCalledWith(['type_1']);
    rerender(
      <FilterTop
        {...mockFilterTopPropsWithState({
          insuranceTypes: ['type_1'],
          onInsuranceTypesChange,
        })}
      />
    );
    expect(cbType1.checked).toBe(true);
    fireEvent.click(cbType3);
    expect(onInsuranceTypesChange).toHaveBeenCalledWith(['type_1', 'type_3']);
    rerender(
      <FilterTop
        {...mockFilterTopPropsWithState({
          insuranceTypes: ['type_1', 'type_3'],
          onInsuranceTypesChange,
        })}
      />
    );
    expect(cbType1.checked).toBe(true);
    expect(cbType3.checked).toBe(true);
    fireEvent.click(cbType1);
    expect(onInsuranceTypesChange).toHaveBeenCalledWith(['type_3']);
  });

  it('checks repair type and deductible options independently', () => {
    const { onRepairTypesChange, onDeductiblesChange } =
      mockFilterTopPropsWithCallbacks;
    renderFilterTop(mockFilterTopPropsWithCallbacks);

    const garage = screen.getByLabelText('Garage') as HTMLInputElement;
    const onlyDed = screen.getByLabelText(
      'Only Deductible'
    ) as HTMLInputElement;

    fireEvent.click(garage);
    expect(onRepairTypesChange).toHaveBeenCalledWith(['garage']);

    fireEvent.click(onlyDed);
    expect(onDeductiblesChange).toHaveBeenCalledWith(['only_deductible']);
  });

  it('calls onPriceRangeChange when slider onChange is triggered', () => {
    const onPriceRangeChange = jest.fn();
    const initialPriceRange = [0, 1000000];

    renderFilterTop({
      initialPriceRange,
      onPriceRangeChange,
    });

    // Trigger the onChange callback from the CommonSlider
    const triggerOnChangeButton = screen.getByTestId('trigger-onchange');
    fireEvent.click(triggerOnChangeButton);

    // Verify that onPriceRangeChange was called with the current priceRangeLocal
    expect(onPriceRangeChange).toHaveBeenCalledWith(initialPriceRange);
  });

  it('passes correct props to CommonSlider component', () => {
    const initialPriceRange = [0, 1000000];
    const onPriceRangeChange = jest.fn();

    renderFilterTop({
      initialPriceRange,
      onPriceRangeChange,
    });

    // Verify the slider range is displayed correctly
    const sliderRange = screen.getByTestId('slider-range');
    expect(sliderRange).toHaveTextContent('0-1000000');
  });
});
