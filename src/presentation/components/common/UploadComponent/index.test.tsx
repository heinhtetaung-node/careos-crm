import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UploadComponent from '.';
import * as snackbar from 'utils/snackbar';

// Mock the snackbar utility
const mockShowErrorSnackbar = jest.fn();
jest.mock('utils/snackbar', () => ({
  __esModule: true,
  default: () => ({
    showErrorSnackbar: mockShowErrorSnackbar,
  }),
}));

// Mock the localization utility
jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key, params) => {
    if (key === 'text.errorMessage') {
      return `Error: ${params?.message || 'Unknown error'}`;
    }
    if (key === 'errors.nolargerThan5Mb') {
      return 'File size must be less than 5MB';
    }
    if (key === 'printingAndShippingStatus.docUpload') {
      return 'Upload Document';
    }
    if (key === 'text.dragAndDropFile') {
      return 'Drag and drop file here or';
    }
    if (key === 'text.chooseFile') {
      return 'Choose File';
    }
    return key;
  }),
}));

describe('UploadComponent', () => {
  const mockSetSlip = jest.fn();
  const mockStore = configureStore([]);
  const store = mockStore({});

  const defaultProps = {
    title: 'Upload Document',
    slip: undefined,
    setSlip: mockSetSlip,
    error: false,
  };

  const renderWithProvider = (ui: React.ReactElement) =>
    render(<Provider store={store}>{ui}</Provider>);

  beforeEach(() => {
    mockSetSlip.mockClear();
    mockShowErrorSnackbar.mockClear();
    store.clearActions();

    // Setup snackbar mock
    const mockSnackbar = snackbar.default();
    mockSnackbar.showErrorSnackbar = mockShowErrorSnackbar;
  });

  it('renders the title', () => {
    renderWithProvider(<UploadComponent {...defaultProps} />);
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });

  it('shows uploaded file name if slip is provided', () => {
    renderWithProvider(
      <UploadComponent
        {...defaultProps}
        slip={{ display_name: 'uploaded.pdf' } as any}
      />
    );
    expect(screen.getByText('uploaded.pdf')).toBeInTheDocument();
  });

  it('should show error', () => {
    renderWithProvider(
      <UploadComponent
        {...defaultProps}
        slip={{ display_name: 'uploaded.pdf' } as any}
        error
      />
    );
    expect(screen.getByTestId('file-upload-container')).toHaveClass(
      'border-red-500'
    );
  });

  it('delete file when delete button is clicked', () => {
    const mockDeleteFile = jest.fn();
    renderWithProvider(
      <UploadComponent
        {...defaultProps}
        slip={{ display_name: 'documents/123' } as any}
        deleteFile={mockDeleteFile}
      />
    );
    const deleteButton = screen.getByTestId('file-upload-button');
    fireEvent.click(deleteButton);

    expect(mockDeleteFile).toHaveBeenCalled();
  });

  it('does NOT call openFile when file name does not start with "documents" and button is clicked', () => {
    const mockOpenFile = jest.fn();
    renderWithProvider(
      <UploadComponent
        {...defaultProps}
        slip={
          {
            display_name: 'uploaded.pdf',
            content_type: 'application/pdf',
          } as any
        }
        openFile={mockOpenFile}
      />
    );
    const fileButton = screen.getByRole('button', { name: 'uploaded.pdf' });
    fireEvent.click(fileButton);
    expect(mockOpenFile).not.toHaveBeenCalled();
  });

  describe('File upload functionality', () => {
    it('triggers file input when upload button is clicked', () => {
      renderWithProvider(<UploadComponent {...defaultProps} />);
      const uploadButton = screen.getAllByRole('button')[0]; // Icon button
      fireEvent.click(uploadButton);
      expect(uploadButton).toBeInTheDocument();
    });

    it('triggers file input when choose file button is clicked', () => {
      renderWithProvider(<UploadComponent {...defaultProps} />);
      const chooseFileButton = screen.getByTestId('chooseFileBtn');
      fireEvent.click(chooseFileButton);
      expect(chooseFileButton).toBeInTheDocument();
    });

    it('handles file selection with valid file', () => {
      renderWithProvider(<UploadComponent {...defaultProps} />);
      const fileInput = screen.getByTestId('doc-file');

      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(mockFile, 'size', { value: 1024 }); // 1KB

      fireEvent.change(fileInput, {
        target: {
          files: [mockFile],
        },
      });

      expect(mockSetSlip).toHaveBeenCalledWith({
        display_name: 'test.pdf',
        content_type: 'application/pdf',
        size: 1024,
        value: '', // value is empty string by default
        originalFile: mockFile,
      });
    });

    it('shows error for file larger than 5MB', () => {
      renderWithProvider(<UploadComponent {...defaultProps} />);
      const fileInput = screen.getByTestId('doc-file');

      const mockFile = new File(['test content'], 'large.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(mockFile, 'size', { value: 6 * 1024 * 1024 }); // 6MB

      fireEvent.change(fileInput, {
        target: {
          files: [mockFile],
        },
      });

      expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
        'Error: File size must be less than 5MB'
      );
      expect(mockSetSlip).not.toHaveBeenCalled();
    });

    it('shows error for unsupported file type', () => {
      renderWithProvider(<UploadComponent {...defaultProps} />);
      const fileInput = screen.getByTestId('doc-file');

      const mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });
      Object.defineProperty(mockFile, 'size', { value: 1024 }); // 1KB

      fireEvent.change(fileInput, {
        target: {
          files: [mockFile],
        },
      });

      expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
        'Error: File size must be less than 5MB'
      );
      expect(mockSetSlip).not.toHaveBeenCalled();
    });

    it('handles file input with no files', () => {
      renderWithProvider(<UploadComponent {...defaultProps} />);
      const fileInput = screen.getByTestId('doc-file');

      fireEvent.change(fileInput, {
        target: {
          files: null,
        },
      });

      expect(mockSetSlip).not.toHaveBeenCalled();
      expect(mockShowErrorSnackbar).not.toHaveBeenCalled();
    });

    it('handles supported image types', () => {
      renderWithProvider(<UploadComponent {...defaultProps} />);
      const fileInput = screen.getByTestId('doc-file');

      const supportedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/JPG',
        'image/JPEG',
        'image/PNG',
        'application/pdf',
      ];

      supportedTypes.forEach((type) => {
        const mockFile = new File(
          ['test content'],
          `test.${type.split('/')[1]}`,
          { type }
        );
        Object.defineProperty(mockFile, 'size', { value: 1024 }); // 1KB

        fireEvent.change(fileInput, {
          target: {
            files: [mockFile],
          },
        });

        // Always expect lowercase for content_type
        expect(mockSetSlip).toHaveBeenCalledWith({
          display_name: `test.${type.split('/')[1]}`,
          content_type: type.toLowerCase(),
          size: 1024,
          value: '',
          originalFile: mockFile,
        });

        // Reset for next iteration
        mockSetSlip.mockClear();
      });
    });

    it('shows default title when no title prop is provided', () => {
      renderWithProvider(
        <UploadComponent {...defaultProps} title={undefined} />
      );
      expect(screen.getByText('Upload Document')).toBeInTheDocument();
    });

    it('shows content type when file is uploaded', () => {
      renderWithProvider(
        <UploadComponent
          {...defaultProps}
          slip={
            {
              display_name: 'test.pdf',
              content_type: 'application/pdf',
            } as any
          }
        />
      );
      expect(screen.getByText('application/pdf')).toBeInTheDocument();
    });

    it('shows drag and drop text when no file is uploaded', () => {
      renderWithProvider(<UploadComponent {...defaultProps} />);
      expect(
        screen.getByText(/Drag and drop file here or/)
      ).toBeInTheDocument();
      expect(screen.getByText('Choose File')).toBeInTheDocument();
    });
  });
});
