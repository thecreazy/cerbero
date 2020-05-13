import Selection from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[Selection Service] Testing base', () => {
  const selectionEvent = Selection.formatEvent(event);
  output.after = selectionEvent.after;
  output.time = selectionEvent.time;
  expect(selectionEvent).toEqual(output);
});
