import LongTask from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[LongTask Service] Testing base', () => {
  const result = LongTask.formatEvent(event);
  output.time = result.time;
  output.after = result.after;
  expect(result).toEqual(output);
});
