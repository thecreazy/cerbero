import { extendedEnvPlugin } from './index';

const mockVoices = [
  { lang: 'it-IT', name: 'Alice' },
  { lang: 'en-US', name: 'Bob' },
  { lang: 'en-US', name: 'Carol' },
];

const setupMocks = () => {
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: { getVoices: jest.fn(() => mockVoices), onvoiceschanged: null },
  });
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      enumerateDevices: jest.fn().mockResolvedValue([
        { kind: 'videoinput' }, { kind: 'audioinput' }, { kind: 'audioinput' }, { kind: 'audiooutput' },
      ]),
    },
  });
  Object.defineProperty(navigator, 'storage', {
    writable: true,
    value: { estimate: jest.fn().mockResolvedValue({ usage: 1024, quota: 1024 * 100 }) },
  });
  Object.defineProperty(navigator, 'permissions', {
    writable: true,
    value: { query: jest.fn().mockResolvedValue({ state: 'prompt' }) },
  });
};

beforeEach(() => {
  setupMocks();
  // Remove keyboard by default — tests that need it will set it
  Object.defineProperty(navigator, 'keyboard', { writable: true, value: undefined });
});

test('[extendedEnvPlugin] base: emits extendedEnv with all fields', async () => {
  const emit = jest.fn();
  extendedEnvPlugin().init(emit);
  await new Promise(r => setTimeout(r, 50));
  const [type, data] = emit.mock.calls[0];
  expect(type).toBe('extendedEnv');
  expect(data.speechVoiceCount).toBe(3);
  expect(data.speechLanguages).toContain('it-IT');
  expect(data.mediaDevices).toEqual({ video: 1, audioIn: 2, audioOut: 1 });
  expect(data.storage.used).toBe(1024);
  expect(data.permissions.notifications).toBe('prompt');
  expect(data.keyboardLayout).toBeNull(); // no keyboard mock
});

test('[extendedEnvPlugin] keyboardLayout returns null when navigator.keyboard is undefined', async () => {
  const emit = jest.fn();
  extendedEnvPlugin().init(emit);
  await new Promise(r => setTimeout(r, 50));
  expect(emit.mock.calls[0][1].keyboardLayout).toBeNull();
});

test('[extendedEnvPlugin] keyboardLayout reads KeyQ from getLayoutMap', async () => {
  Object.defineProperty(navigator, 'keyboard', {
    writable: true,
    value: {
      getLayoutMap: jest.fn().mockResolvedValue(new Map([['KeyQ', 'q'], ['KeyA', 'a']])),
    },
  });
  const emit = jest.fn();
  extendedEnvPlugin().init(emit);
  await new Promise(r => setTimeout(r, 50));
  expect(emit.mock.calls[0][1].keyboardLayout).toBe('q');
});

test('[extendedEnvPlugin] keyboardLayout is null when KeyQ not in layout map (e.g. non-Latin layout)', async () => {
  Object.defineProperty(navigator, 'keyboard', {
    writable: true,
    value: {
      getLayoutMap: jest.fn().mockResolvedValue(new Map([['KeyA', 'ф'], ['KeyS', 'ы']])), // no KeyQ
    },
  });
  const emit = jest.fn();
  extendedEnvPlugin().init(emit);
  await new Promise(r => setTimeout(r, 50));
  expect(emit.mock.calls[0][1].keyboardLayout).toBeNull();
});

test('[extendedEnvPlugin] keyboardLayout returns null when getLayoutMap throws', async () => {
  Object.defineProperty(navigator, 'keyboard', {
    writable: true,
    value: { getLayoutMap: jest.fn().mockRejectedValue(new Error('not supported')) },
  });
  const emit = jest.fn();
  extendedEnvPlugin().init(emit);
  await new Promise(r => setTimeout(r, 50));
  expect(emit.mock.calls[0][1].keyboardLayout).toBeNull();
});

test('[extendedEnvPlugin] permissions entry is "unsupported" when query throws', async () => {
  (navigator.permissions.query as jest.Mock)
    .mockRejectedValueOnce(new Error('unsupported permission'));
  const emit = jest.fn();
  extendedEnvPlugin().init(emit);
  await new Promise(r => setTimeout(r, 50));
  // First permission name ('notifications') threw → marked unsupported
  expect(emit.mock.calls[0][1].permissions.notifications).toBe('unsupported');
});

test('[extendedEnvPlugin] storage is {null, null} when estimate throws', async () => {
  (navigator.storage.estimate as jest.Mock).mockRejectedValueOnce(new Error('blocked'));
  const emit = jest.fn();
  extendedEnvPlugin().init(emit);
  await new Promise(r => setTimeout(r, 50));
  expect(emit.mock.calls[0][1].storage).toEqual({ used: null, quota: null });
});

test('[extendedEnvPlugin] mediaDevices are zeroes when enumerateDevices throws', async () => {
  (navigator.mediaDevices.enumerateDevices as jest.Mock).mockRejectedValueOnce(new Error('blocked'));
  const emit = jest.fn();
  extendedEnvPlugin().init(emit);
  await new Promise(r => setTimeout(r, 50));
  expect(emit.mock.calls[0][1].mediaDevices).toEqual({ video: 0, audioIn: 0, audioOut: 0 });
});

test('[extendedEnvPlugin] storage null when usage/quota undefined', async () => {
  (navigator.storage.estimate as jest.Mock).mockResolvedValueOnce({ usage: undefined, quota: undefined });
  const emit = jest.fn();
  extendedEnvPlugin().init(emit);
  await new Promise(r => setTimeout(r, 50));
  expect(emit.mock.calls[0][1].storage).toEqual({ used: null, quota: null });
});

test('[extendedEnvPlugin] uses onvoiceschanged when voices not immediately available', async () => {
  (speechSynthesis.getVoices as jest.Mock).mockReturnValueOnce([]).mockReturnValueOnce(mockVoices);
  const emit = jest.fn();
  extendedEnvPlugin().init(emit);
  speechSynthesis.onvoiceschanged?.(new Event('voiceschanged') as SpeechSynthesisEvent);
  await new Promise(r => setTimeout(r, 50));
  expect(emit.mock.calls[0][1].speechVoiceCount).toBe(3);
});
