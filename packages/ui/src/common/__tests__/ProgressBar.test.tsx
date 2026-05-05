import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../ProgresBar';
import Step from '../ProgresBar/Step';

describe('ProgressBar', () => {
  it('renders', () => {
    render(<ProgressBar percent={50} />);
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toBeDefined();
    expect(progressBar.style.width).toHaveBeenCalled;
  });

  it('should throw an error when the number of children does not match the length of the positions array', () => {
    const children = [
      <Step key={1}>{() => null}</Step>,
      <Step key={2}>{() => null}</Step>,
    ];
    const stepPositions = [0, 50, 100];
    expect(() => {
      render(
        <ProgressBar percent={50} stepPositions={stepPositions}>
          {children}
        </ProgressBar>
      );
    }).toThrow();
  });

  it('should render children step with text', () => {
    const children = [
      <Step key={1}>{() => null}</Step>,
      <Step key={2}>{() => null}</Step>,
    ];
    const stepPositions = [0, 100];
    render(
      <ProgressBar percent={100} stepPositions={stepPositions} text="Test">
        {children}
      </ProgressBar>
    );
    const step = screen.getAllByTestId('step');
    expect(step).toBeDefined();
  });

  it('should pass correct position and index to children', () => {
    const MockStep = ({
      position,
      index,
    }: {
      position: number;
      index: number;
    }) => <div data-testid={`step-${index}`}>{position}</div>;
    render(
      <ProgressBar percent={50}>
        <MockStep position={0} index={0} />
        <MockStep position={50} index={1} />
        <MockStep position={100} index={2} />
      </ProgressBar>
    );
    const firstStep = screen.getByTestId('step-0');
    expect(firstStep.textContent).toBe('0');

    const secondStep = screen.getByTestId('step-1');
    expect(secondStep.textContent).toBe('50');

    const thirdStep = screen.getByTestId('step-2');
    expect(thirdStep.textContent).toBe('100');
  });
});
