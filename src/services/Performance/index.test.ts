import Performance from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[Performance Service] Testing base', () => {
  const performaceEvent = Performance.formatEvent(event);
  output.time = performaceEvent.time;
  expect(performaceEvent).toEqual(output);
});
