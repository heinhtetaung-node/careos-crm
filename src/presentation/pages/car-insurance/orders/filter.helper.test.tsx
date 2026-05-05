import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import '@testing-library/jest-dom';
import { salesAgentsField } from './filterFields';

import { server } from '__mocks__/server';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { MockUsersData } from 'mock-data/UserData.mock';

beforeEach(() => {
  server.use(
    http.get(`${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users`, () =>
      HttpResponse.json(MockUsersData)
    )
  );
});

describe('Render <Autocomplete/> component depending on feature flag', () => {
  it('should render new <Autocomplete/> component when feature flag turn on', () => {
    const { InputComponent: Autocomplete, inputProps } =
      salesAgentsField(true)[0];

    render(<Autocomplete {...inputProps} />);
    expect(screen.getByTestId('sales-agent-autocomplete')).toBeInTheDocument();
  });
});

describe('Test <Autocomplete/> asynchronous behavior', () => {
  it('should <Autocomplete/> render options asynchronously', async () => {
    const { InputComponent: Autocomplete, inputProps } =
      salesAgentsField(true)[0];

    render(<Autocomplete {...inputProps} />);
    const textField = screen.getByPlaceholderText('text.select');

    await userEvent.click(textField);
    await waitFor(() => {
      expect(screen.getByText('text.noAssignee')).toBeInTheDocument();
      expect(screen.getByText('CypressUpd TestUpd')).toBeInTheDocument();
      expect(screen.getByText('Training16 Ojt')).toBeInTheDocument();
    });
  });
});
