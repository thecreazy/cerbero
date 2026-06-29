import ElementVisible from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[ElementVisible Service] Testing base', () => {
  const result = ElementVisible.formatEvent(event);
  output.time = result.time;
  output.after = result.after;
  expect(result).toEqual(output);
});

test('[ElementVisible Service] without startDate falls back gracefully', () => {
  const { startDate: _sd, ...eventWithoutDate } = event;
  const result = ElementVisible.formatEvent(eventWithoutDate);
  expect(result.data.selector).toBe('.hero');
  expect(result.data.visibleRatio).toBe(0.75);
});
