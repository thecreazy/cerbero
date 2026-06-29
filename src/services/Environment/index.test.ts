import Environment from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[Environment Service] Testing base', () => {
  const result = Environment.formatEvent(event);
  output.time = result.time;
  expect(result).toEqual(output);
});
