import { fireEvent } from '@testing-library/react';
import user from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import getApiEndpoint from 'utils/endpointHelper';

import CommentTextBox from './CommentTextBox';

var mockSnackBar: jest.Mock;
jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
}));

jest.mock('presentation/redux/actions/ui', () => {
  mockSnackBar = jest.fn((param: any) => ({ type: '', payload: param }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockSnackBar,
  };
});

jest.mock('data/slices/authSlice', () => ({
  ...jest.requireActual('data/slices/authSlice'),
  useGetAuthenticateQuery: jest.fn(),
}));

const mockGetAuthenticateQuery = useGetAuthenticateQuery as jest.Mock;

const initialState = {
  leadsDetailReducer: { lead: { payload: { name: 'leads/leadId' } } },
};

describe('<CommentTextBox Component/>', () => {
  beforeEach(() => {
    mockGetAuthenticateQuery.mockClear();
    mockGetAuthenticateQuery.mockImplementation(() => ({
      data: {
        role: 'roles/admin',
      },
    }));
  });

  it('will be mounted correctly', async () => {
    render(<CommentTextBox />);
    expect(screen.getByTestId('comment-text-box-main')).toBeInTheDocument();
  });

  it('check tab Comment exits', () => {
    render(<CommentTextBox />);
    expect(
      screen.getByRole('tab', { name: 'lead.comment' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'lead.remark' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'lead.document' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'lead.script' })
    ).toBeInTheDocument();
  });

  it('on change Text area', async () => {
    render(<CommentTextBox />);
    await user.type(screen.getByRole('textbox'), 'this is content');
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('check button save exits', () => {
    render(<CommentTextBox />);
    expect(
      screen.getByRole('button', { name: 'text.save' })
    ).toBeInTheDocument();
  });

  it('click to button save', async () => {
    render(<CommentTextBox />);
    await user.type(screen.getByRole('textbox'), 'this is content');
    await user.click(screen.getByRole('button', { name: 'text.save' }));
  });

  it('check the button is disable', () => {
    render(<CommentTextBox isFieldDisabled />);
    expect(screen.getByRole('button', { name: 'text.save' })).toBeDisabled();
  });

  it('check the comment input is disable', () => {
    mockGetAuthenticateQuery.mockClear();
    mockGetAuthenticateQuery.mockImplementation(() => ({
      data: {
        role: 'roles/accounting',
      },
    }));
    render(<CommentTextBox />);
    expect(screen.getByTestId('comment-input')).toBeDisabled();
  });

  it('check the remark input is disable', () => {
    mockGetAuthenticateQuery.mockClear();
    mockGetAuthenticateQuery.mockImplementation(() => ({
      data: {
        role: 'roles/accounting',
      },
    }));
    render(<CommentTextBox />);
    fireEvent.click(screen.getByText('lead.remark'));
    expect(screen.getByTestId('remark-input')).toBeDisabled();
  });
});

describe('<CommentTextBox />, Script tab', () => {
  beforeEach(() => {
    mockSnackBar.mockClear();
    mockGetAuthenticateQuery.mockClear();
    mockGetAuthenticateQuery.mockImplementation(() => ({
      data: {
        role: 'roles/admin',
      },
    }));
    server.use(
      http.get(getApiEndpoint('/v1alpha1/undefined:generateScript'), () =>
        HttpResponse.json({ script: 'This is a return script' })
      )
    );
  });

  it('should render all component', async () => {
    render(<CommentTextBox />, { initialState });
    expect(screen.getByTestId('comment-text-box-main')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'lead.script' }));
    expect(screen.getByTestId('script-input')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'text.save' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'text.save' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'text.generate' })
    ).toBeInTheDocument();
  });

  it('should generate script if click generate', async () => {
    render(<CommentTextBox />);
    await user.click(screen.getByRole('tab', { name: 'lead.script' }));
    await user.click(screen.getByRole('button', { name: 'text.generate' }));
    await waitFor(() =>
      expect(screen.getByTestId('script-input')).toHaveTextContent(
        'This is a return script'
      )
    );
  });

  it('should display error snackbar if api throws error with generic error structure', async () => {
    server.use(
      http.get(getApiEndpoint('/v1alpha1/undefined:generateScript'), () =>
        HttpResponse.json(
          {
            code: 3,
            message: 'validation error',
            details: [
              {
                '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
                reason: 'REQUEST_VALIDATION_ERROR',
                metadata: {
                  detail: 'no successful transaction/charges for the lead.',
                  field: 'leadTransaction',
                  rule: 'notFound',
                },
              },
              {
                '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
                reason: 'REQUEST_VALIDATION_ERROR',
                metadata: {
                  detail: 'no transaction snapshot for the lead.',
                  field: 'leadTransactionSnapshot',
                  rule: 'notFound',
                },
              },
            ],
          },
          { status: 400 }
        )
      )
    );

    render(<CommentTextBox />);
    await user.click(screen.getByRole('tab', { name: 'lead.script' }));
    await user.click(screen.getByRole('button', { name: 'text.generate' }));
    await waitFor(() =>
      expect(mockSnackBar).toHaveBeenNthCalledWith(1, {
        isOpen: true,
        message:
          'errors.leadTransactionNotFound. errors.leadTransactionSnapshotNotFound',
        status: 'error',
      })
    );
  });

  it('should display error snackbar if api throws error', async () => {
    server.use(
      http.get(getApiEndpoint('/v1alpha1/undefined:generateScript'), () =>
        HttpResponse.json(
          {
            code: 3,
            message: 'validation error',
            details: [],
          },
          { status: 400 }
        )
      )
    );

    render(<CommentTextBox />);
    await user.click(screen.getByRole('tab', { name: 'lead.script' }));
    await user.click(screen.getByRole('button', { name: 'text.generate' }));
    await waitFor(() =>
      expect(mockSnackBar).toHaveBeenNthCalledWith(1, {
        isOpen: true,
        message: 'clipboard.apiFailure',
        status: 'error',
      })
    );
  });

  it('should save the script', async () => {
    render(<CommentTextBox />);
    await user.click(screen.getByRole('tab', { name: 'lead.script' }));
    await user.type(screen.getByTestId('script-input'), 'Script');
    await user.click(screen.getByRole('button', { name: 'text.save' }));
  });
});
