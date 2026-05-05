import React from 'react';

import { render, screen, fireEvent } from '__tests__/rtl-test-utils';

import DefaultDropzone from './index';

jest.mock('presentation/redux/actions/importFile', () => ({
  ...jest.requireActual('presentation/redux/actions/importFile'),
  setFile: jest.fn().mockReturnValue({
    type: 'hello',
  }),
}));

describe('<DropZone/>', () => {
  it('should drop', async () => {
    render(<DefaultDropzone />);
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url');
    const inputEl = screen.getByTestId('file-drop-input');
    const testfile = {
      text: jest.fn().mockReturnValue(
        new Promise((resolve) => {
          resolve('foo');
        })
      ),
    };
    Object.defineProperty(inputEl, 'files', {
      value: [testfile],
    });
    fireEvent.drop(inputEl);
  });
});
