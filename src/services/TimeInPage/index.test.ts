import TimeInPage from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[TimeInPage Service] Testing base', () => {
  const timeInPageEvenT = TimeInPage.formatEvent(event);
  output.time = timeInPageEvenT.time;
  expect(timeInPageEvenT).toEqual(output);
});
