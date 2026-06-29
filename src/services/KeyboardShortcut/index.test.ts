import KeyboardShortcut from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[KeyboardShortcut Service] Testing base', () => {
  const result = KeyboardShortcut.formatEvent(event);
  output.time = result.time;
  output.after = result.after;
  expect(result).toEqual(output);
});

test('[KeyboardShortcut Service] meta key combo', () => {
  const result = KeyboardShortcut.formatEvent({
    key: 'k',
    ctrlKey: false,
    metaKey: true,
    altKey: false,
    shiftKey: false,
    combo: 'meta+k',
  });
  expect(result.data.combo).toBe('meta+k');
  expect(result.data.modifiers.meta).toBe(true);
  expect(result.data.modifiers.ctrl).toBe(false);
});
