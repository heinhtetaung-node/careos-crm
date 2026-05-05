import { render, screen } from '__tests__/rtl-test-utils';
import { CallStatus } from 'presentation/redux/reducers/leadDetail/call';
import React from 'react';

import AudioTrack from '.';

const mockLeadReducer = {
  payload: {
    data: {
      customerPhoneNumber: [
        {
          phone: '0999999999',
          status: 'unverified',
        },
        {
          phone: '0899999999',
          status: 'unverified',
        },
        {
          phone: '0799999999',
          status: 'unverified',
        },
      ],
      primaryPhoneIndex: 1,
    },
  },
};

describe('<AudioTrack /> tests', () => {
  it('renders successfully', () => {
    const initialState = {
      leadsDetailReducer: {
        callReducer: {
          data: {
            callStatus: CallStatus.Join,
            audioStream: null,
          },
        },
        lead: mockLeadReducer,
      },
    };

    render(<AudioTrack />, { initialState });
    expect(screen.getByTestId('unittest-audio-track')).toBeInTheDocument();
  });

  it('when calling waiting sound should be played', () => {
    const initialState = {
      leadsDetailReducer: {
        callReducer: {
          data: {
            callStatus: CallStatus.Calling,
            audioStream: null,
          },
        },
        lead: mockLeadReducer,
      },
    };

    render(<AudioTrack />, { initialState });
    expect(screen.getByTestId('unittest-audio-track')).toHaveAttribute(
      'src',
      `/static/sounds/bleep.mp3`
    );
  });

  it('when calling ending sound should be played', () => {
    const initialState = {
      leadsDetailReducer: {
        callReducer: {
          data: {
            callStatus: CallStatus.End,
            audioStream: null,
          },
        },
        lead: mockLeadReducer,
      },
    };

    render(<AudioTrack />, { initialState });
    expect(screen.getByTestId('unittest-audio-track')).toHaveAttribute(
      'src',
      `/static/sounds/bleep.mp3`
    );
  });
});
