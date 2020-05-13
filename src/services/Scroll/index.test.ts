import Scroll from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[Scroll Service] Testing base', () => {
  const scrollEvent = Scroll.formatEvent(event);
  output.after = scrollEvent.after;
  output.time = scrollEvent.time;
  expect(scrollEvent).toEqual(output);
});
