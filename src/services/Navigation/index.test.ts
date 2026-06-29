import Navigation from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[Navigation Service] Testing base', () => {
  const result = Navigation.formatEvent(event);
  output.time = result.time;
  output.after = result.after;
  expect(result).toEqual(output);
});

test('[Navigation Service] with null from/to', () => {
  const result = Navigation.formatEvent({ from: null, to: null, navigationType: 'reload' });
  expect(result.data.from).toBeNull();
  expect(result.data.to).toBeNull();
  expect(result.data.navigationType).toBe('reload');
});
