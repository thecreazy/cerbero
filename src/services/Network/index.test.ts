import Network from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[Network Service] Testing base', () => {
  const result = Network.formatEvent(event);
  output.time = result.time;
  expect(result).toEqual(output);
});

test('[Network Service] Testing with undefined fields falls back to null/false', () => {
  const result = Network.formatEvent({ startDate: 1589182158600 });
  expect(result.data.effectiveType).toBeNull();
  expect(result.data.downlink).toBeNull();
  expect(result.data.rtt).toBeNull();
  expect(result.data.saveData).toBe(false);
});
