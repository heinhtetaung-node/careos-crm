import mockDocuments from '@alphafounders/mock-data/json/uploadedCustomerDocuments.json';
import { renderHook, act } from '@testing-library/react';
import { useSelector } from 'react-redux'; // Mock this for Redux state
import useCurrentFile from './useCurrentFile';

// Mock the useSelector hook for Redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

// Define the default state
const defaultState = {
  typeSelectorReducer: {
    globalProductSelectorReducer: {
      data: {
        id: 'motor-insurance',
        name: 'motor-insurance',
      },
    },
  },
};

// Mock `useSelector` to return the default state
beforeEach(() => {
  (useSelector as any).mockImplementation((selector: any) =>
    selector(defaultState)
  );
});

// will remove after mock data available in the next PR!!
const documents = mockDocuments.documents.slice(-2).reverse(); // get last two documents

test('should current file return when label passed', () => {
  const { result } = renderHook(() =>
    useCurrentFile({ documents, label: 'vehiclePictureFront' })
  );

  expect(result.current[0].docType).toBe('png');
  expect(result.current[0].currentFile).toMatchObject(documents[0]);

  act(() => {
    result.current[1]('firstNamedDriverLicense'); // setCurrentFile
  });
  expect(result.current[0].docType).toBe('pdf');
  expect(result.current[0].currentFile).toMatchObject(documents[1]);
});

test('should undefined return when there is unknown label', () => {
  const { result } = renderHook(() =>
    useCurrentFile({ documents, label: 'unknownLabel' })
  );

  expect(result.current[0].docType).toBe('');
  expect(result.current[0].currentFile).toBe(undefined);
});

test('should getFieldFromPolicyDocTypeByLabel return correct value depending on the passing field value', () => {
  const { result } = renderHook(() =>
    useCurrentFile({ documents, label: 'vehiclePictureFront' })
  );

  expect(result.current[2]('title')).toBe(
    'leadDetailFields.vehiclePictureFront'
  );

  act(() => {
    result.current[1]('unknownLabel'); // setCurrentFile
  });
  expect(result.current[2]('title')).toBe('Other');
});
