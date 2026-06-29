import COSTANTS from '../../constants';

interface KeyboardShortcutInput {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  combo: string;
  startDate?: number;
}

class KeyboardShortcut {
  static formatEvent = (data: KeyboardShortcutInput) => ({
    type: COSTANTS.events.keyboardShortcut,
    time: Date.now(),
    after: Date.now() - (data.startDate ?? 0),
    data: {
      key: data.key,
      combo: data.combo,
      modifiers: {
        ctrl: data.ctrlKey,
        meta: data.metaKey,
        alt: data.altKey,
        shift: data.shiftKey,
      },
    },
  })
}

export default KeyboardShortcut;
