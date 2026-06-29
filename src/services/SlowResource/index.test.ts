import SlowResource from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[SlowResource Service] Testing base', () => {
  const result = SlowResource.formatEvent(event);
  output.time = result.time;
  output.after = result.after;
  expect(result).toEqual(output);
});
