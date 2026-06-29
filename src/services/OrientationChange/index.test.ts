import OrientationChange from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[OrientationChange Service] Testing base', () => {
  const result = OrientationChange.formatEvent(event);
  output.time = result.time;
  expect(result).toEqual(output);
});
