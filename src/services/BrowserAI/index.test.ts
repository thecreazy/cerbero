import BrowserAI from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[BrowserAI Service] Testing base', () => {
  const result = BrowserAI.formatEvent(event);
  output.time = result.time;
  expect(result).toEqual(output);
});
