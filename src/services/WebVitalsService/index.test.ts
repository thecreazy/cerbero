import WebVitals from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[TimeInPage Service] Testing base', () => {
  const webVitalsEvent = WebVitals.formatEvent(event);
  output.time = webVitalsEvent.time;
  output.data.id = webVitalsEvent.data.id;
  output.after = webVitalsEvent.after;
  expect(webVitalsEvent).toEqual(output);
});
