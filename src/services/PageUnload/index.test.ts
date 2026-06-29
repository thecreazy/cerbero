import PageUnload from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[PageUnload Service] Testing base', () => {
  const result = PageUnload.formatEvent(event);
  output.time = result.time;
  expect(result).toEqual(output);
});

test('[PageUnload Service] after equals timeOnPage', () => {
  const result = PageUnload.formatEvent({ startDate: 0, timeOnPage: 12000 });
  expect(result.after).toBe(12000);
  expect(result.data.timeOnPage).toBe(12000);
});
