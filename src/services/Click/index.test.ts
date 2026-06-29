import Click from './index';
import event from './__test__/index';

test('[Click Service] Testing base', () => {
  const clickEvent = Click.formatEvent(event);
  expect(clickEvent).toEqual({
    type: 'click',
    time: clickEvent.time,
    after: clickEvent.after,
    data: {
      position: {
        screenX: 256,
        screenY: 513,
        clientX: 256,
        clientY: 434,
        pageX: 256,
        pageY: 434,
        x: 256,
        y: 434,
        offsetX: 256,
        offsetY: 167,
      },
      keys: { ctrlKey: false, shiftKey: false, altKey: false, metaKey: false },
      pointerType: null,
      elements: {
        target: {
          id: '',
          type: 'DIV',
          className: 'n p',
          domType: 'HTMLDivElement',
          identifier: 'div',
        },
      },
    },
  });
});

test('[Click Service] with pointerType from touch', () => {
  const result = Click.formatEvent({ ...event, pointerType: 'touch' });
  expect(result.data.pointerType).toBe('touch');
});

test('[Click Service] with pointerType from pen', () => {
  const result = Click.formatEvent({ ...event, pointerType: 'pen' });
  expect(result.data.pointerType).toBe('pen');
});

test('[Click Service] with undefined target fields uses empty string fallbacks', () => {
  const result = Click.formatEvent({ startDate: 1589180808707 });
  expect(result.data.elements.target).toEqual({
    id: '', type: '', className: '', domType: '', identifier: '',
  });
});

test('[Click Service] with domPath includes domStructure in target', () => {
  const result = Click.formatEvent({
    ...event,
    targetDomStructure: ' > html > body > div',
  });
  expect(result.data.elements.target.domStructure).toBe(' > html > body > div');
});

test('[Click Service] with domPosition includes position in target', () => {
  const pos = { x: 0, y: 100, width: 200, height: 50, top: 100, right: 200, bottom: 150, left: 0 };
  const result = Click.formatEvent({
    ...event,
    targetPosition: pos,
  });
  expect(result.data.elements.target.position).toEqual(pos);
});
