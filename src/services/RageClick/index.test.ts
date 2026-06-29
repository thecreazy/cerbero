import RageClick from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[RageClick Service] Testing base', () => {
  const result = RageClick.formatEvent(event);
  output.time = result.time;
  output.after = result.after;
  expect(result).toEqual(output);
});

test('[RageClick Service] without startDate falls back gracefully', () => {
  const { startDate: _sd, ...eventWithoutDate } = event;
  const result = RageClick.formatEvent(eventWithoutDate);
  expect(result.data.count).toBe(4);
  expect(result.type).toBe('rageClick');
});
