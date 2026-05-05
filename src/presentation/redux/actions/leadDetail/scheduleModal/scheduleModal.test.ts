import { getAppointment, LeadActionTypes } from './index';

test('calls getAppointment', () => {
  const result = getAppointment('00/00/00', 'test');

  expect(result).toEqual({
    type: LeadActionTypes.GET_APPOINTMENT,
    payload: {
      startDate: '00/00/00',
      filter: 'test',
    },
  });

  expect(getAppointment('00/00/00')).toEqual({
    type: LeadActionTypes.GET_APPOINTMENT,
    payload: {
      startDate: '00/00/00',
      filter: '',
    },
  });
});
