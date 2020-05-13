import MouseExit from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[MouseExit Service] Testing base', () => {
  const mouseExitEvent = MouseExit.formatEvent(event);
  output.after = mouseExitEvent.after;
  output.time = mouseExitEvent.time;
  expect(mouseExitEvent).toEqual(output);
});
