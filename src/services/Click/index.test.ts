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
      elements: { target: {
        className: 'n p',
        domStructure: ' > html > body > div#root > div > article > div > section > div',
        domType: 'HTMLDivElement',
        id: '',
        identifier: 'div',
        position:  {
          bottom: 464.390625,
          height: 196.390625,
          left: 0,
          right: 1905,
          top: 268,
          width: 1905,
          x: 0,
          y: 268,
        },
        textContent: 'How you can improve your workflow using the JavaScript consoleRiccardo CanellaJun 11, 2018 · 5 min read',
        type: 'DIV',
      } },
    },
  });
});
