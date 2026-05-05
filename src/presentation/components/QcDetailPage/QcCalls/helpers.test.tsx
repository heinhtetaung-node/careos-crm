import { intervalToDuration } from 'utils/datetime';

import { durationToMinutes, getAudioFiles } from './helpers';

test('Should durationToMinutes function work', () => {
  const mockDuration = {
    duration: intervalToDuration({
      start: new Date('2022-06-09T04:23:39.249669Z'),
      end: new Date('2022-06-09T04:27:21.969175Z'),
    }),
  };
  expect(durationToMinutes(mockDuration.duration)).toBe(
    '3:42 text.minutesAcronym'
  );
});

test('Should durationToMinutes function work', () => {
  const mockDuration = {
    duration: intervalToDuration({
      start: new Date('2022-06-09T03:29:39.249669Z'),
      end: new Date('2022-06-09T03:29:55.969175Z'),
    }),
  };
  expect(durationToMinutes(mockDuration.duration)).toBe(
    '0:16 text.minutesAcronym'
  );
});

test('Should getAudioFiles function work', () => {
  const mockParticipants: any = [
    {
      name: 'calls/c7b19607-b8b9-451f-a80c-cadbadb5f272',
      createTime: '2022-06-09T04:03:21.969175Z',
      createBy: 'Rabbit Testing',
      updateTime: '2022-06-09T04:03:17.678153Z',
      deleteTime: '2022-06-09T04:03:39.249669Z',
      communicationType: 'call',
      id: 1,
      duration: intervalToDuration({
        start: new Date('2022-06-09T04:03:39.249669Z'),
        end: new Date('2022-06-09T04:03:21.969175Z'),
      }),
    },
  ];
  const audioFiles = getAudioFiles(mockParticipants);
  expect(audioFiles[0].duration).toBe('0:17 text.minutesAcronym');
  expect(audioFiles[0].url).toMatch(
    /calls\/c7b19607-b8b9-451f-a80c-cadbadb5f272\/recording/
  );
  expect(audioFiles[0].date).toBe('09/06/2022 (11:03:21 AM)');
});
