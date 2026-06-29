import MouseExit from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[MouseExit Service] Testing base', () => {
  const mouseExitEvent = MouseExit.formatEvent(event);
  output.after = mouseExitEvent.after;
  output.time = mouseExitEvent.time;
  expect(mouseExitEvent).toEqual(output);
});

test('[MouseExit Service] with undefined target fields uses empty string fallbacks', () => {
  const result = MouseExit.formatEvent({ startDate: 1589181657060 });
  expect(result.data.elements.target).toEqual({
    id: '', type: '', className: '', domType: '', identifier: '',
  });
});

test('[MouseExit Service] with domPath includes domStructure in target', () => {
  const result = MouseExit.formatEvent({
    ...event,
    targetDomStructure: ' > html > body > div',
  });
  expect(result.data.elements.target.domStructure).toBe(' > html > body > div');
});

test('[MouseExit Service] with domPosition includes position in target', () => {
  const pos = { x: 0, y: 100, width: 200, height: 50, top: 100, right: 200, bottom: 150, left: 0 };
  const result = MouseExit.formatEvent({
    ...event,
    targetPosition: pos,
  });
  expect(result.data.elements.target.position).toEqual(pos);
});
