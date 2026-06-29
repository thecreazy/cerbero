import { fingerprintPlugin } from './index';

// Stable crypto.subtle mock
Object.defineProperty(global, 'crypto', {
  writable: true,
  value: {
    subtle: {
      digest: jest.fn().mockImplementation(async () => new Uint8Array(32).fill(0xab).buffer),
    },
  },
});

const makeCanvasMock = (overrides: {
  ctx?: Partial<CanvasRenderingContext2D> | null;
  webglCtx?: Partial<WebGLRenderingContext> | null;
} = {}) => ({
  width: 0,
  height: 0,
  getContext: (type: string) => {
    if (type === '2d') {
      if (overrides.ctx === null) return null;
      return {
        textBaseline: '',
        font: '',
        fillStyle: '',
        fillRect: jest.fn(),
        fillText: jest.fn(),
        ...overrides.ctx,
      };
    }
    if (type === 'webgl' || type === 'experimental-webgl') {
      if (overrides.webglCtx === null) return null;
      return {
        getExtension: jest.fn(() => ({ UNMASKED_VENDOR_WEBGL: 0x9245, UNMASKED_RENDERER_WEBGL: 0x9246 })),
        getParameter: jest.fn((p: number) => p === 0x9245 ? 'Google Inc.' : 'ANGLE (Intel)'),
        VENDOR: 37446,
        ...overrides.webglCtx,
      };
    }
    return null;
  },
  toDataURL: jest.fn(() => 'data:image/png;base64,abc123'),
});

const makeAudioMock = (overrides: Partial<AudioContext> = {}) => ({
  createOscillator: () => ({ connect: jest.fn(), start: jest.fn(), stop: jest.fn() }),
  createAnalyser: () => ({
    connect: jest.fn(),
    frequencyBinCount: 4,
    getFloatFrequencyData: jest.fn((buf: Float32Array) => { buf[0] = -100; }),
  }),
  createGain: () => ({ connect: jest.fn(), gain: { value: 0 } }),
  destination: {},
  close: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const mockCreateElement = (overrides: Parameters<typeof makeCanvasMock>[0] = {}) => {
  jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') return makeCanvasMock(overrides) as unknown as HTMLCanvasElement;
    return document.createElement(tag);
  });
};

afterEach(() => jest.restoreAllMocks());

test('[fingerprintPlugin] emits fingerprint event with canvas, webgl, audio', async () => {
  mockCreateElement();
  Object.defineProperty(window, 'AudioContext', { writable: true, value: jest.fn(() => makeAudioMock()) });
  const emit = jest.fn();
  fingerprintPlugin().init(emit);
  await new Promise(r => setTimeout(r, 200));
  expect(emit).toHaveBeenCalledTimes(1);
  const [type, data] = emit.mock.calls[0];
  expect(type).toBe('fingerprint');
  expect(data.webglVendor).toBe('Google Inc.');
  expect(data.webglRenderer).toBe('ANGLE (Intel)');
  expect(data.canvas).toMatch(/^[0-9a-f]{64}$/);
  expect(data.audio).toMatch(/^[0-9a-f]{64}$/);
});

test('[fingerprintPlugin] canvas returns null when getContext("2d") returns null', async () => {
  mockCreateElement({ ctx: null });
  Object.defineProperty(window, 'AudioContext', { writable: true, value: jest.fn(() => makeAudioMock()) });
  const emit = jest.fn();
  fingerprintPlugin().init(emit);
  await new Promise(r => setTimeout(r, 200));
  expect(emit.mock.calls[0][1].canvas).toBeNull();
});

test('[fingerprintPlugin] canvas returns null when toDataURL throws', async () => {
  mockCreateElement({ ctx: { fillText: jest.fn(() => { throw new Error('blocked'); }) } });
  Object.defineProperty(window, 'AudioContext', { writable: true, value: jest.fn(() => makeAudioMock()) });
  const emit = jest.fn();
  fingerprintPlugin().init(emit);
  await new Promise(r => setTimeout(r, 200));
  expect(emit.mock.calls[0][1].canvas).toBeNull();
});

test('[fingerprintPlugin] webgl returns nulls when getContext("webgl") returns null', async () => {
  mockCreateElement({ webglCtx: null });
  Object.defineProperty(window, 'AudioContext', { writable: true, value: jest.fn(() => makeAudioMock()) });
  const emit = jest.fn();
  fingerprintPlugin().init(emit);
  await new Promise(r => setTimeout(r, 200));
  const data = emit.mock.calls[0][1];
  expect(data.webglVendor).toBeNull();
  expect(data.webglRenderer).toBeNull();
  expect(data.webglHash).toBeNull();
});

test('[fingerprintPlugin] webgl returns nulls when getParameter throws', async () => {
  mockCreateElement({ webglCtx: { getParameter: jest.fn(() => { throw new Error('webgl error'); }) } });
  Object.defineProperty(window, 'AudioContext', { writable: true, value: jest.fn(() => makeAudioMock()) });
  const emit = jest.fn();
  fingerprintPlugin().init(emit);
  await new Promise(r => setTimeout(r, 200));
  const data = emit.mock.calls[0][1];
  expect(data.webglVendor).toBeNull();
});

test('[fingerprintPlugin] webgl falls back to gl.VENDOR when WEBGL_debug_renderer_info extension is unavailable', async () => {
  mockCreateElement({
    webglCtx: {
      getExtension: jest.fn(() => null),  // extension not supported
      getParameter: jest.fn(() => 'FallbackVendor'),
    },
  });
  Object.defineProperty(window, 'AudioContext', { writable: true, value: jest.fn(() => makeAudioMock()) });
  const emit = jest.fn();
  fingerprintPlugin().init(emit);
  await new Promise(r => setTimeout(r, 200));
  const data = emit.mock.calls[0][1];
  expect(data.webglVendor).toBe('FallbackVendor');
  expect(data.webglRenderer).toBe('FallbackVendor');
});

test('[fingerprintPlugin] audio returns null when AudioContext is not available', async () => {
  mockCreateElement();
  Object.defineProperty(window, 'AudioContext', { writable: true, value: undefined });
  Object.defineProperty(window, 'webkitAudioContext', { writable: true, value: undefined });
  const emit = jest.fn();
  fingerprintPlugin().init(emit);
  await new Promise(r => setTimeout(r, 200));
  expect(emit.mock.calls[0][1].audio).toBeNull();
});

test('[fingerprintPlugin] audio returns null when AudioContext throws', async () => {
  mockCreateElement();
  Object.defineProperty(window, 'AudioContext', {
    writable: true,
    value: jest.fn(() => { throw new Error('AudioContext not allowed'); }),
  });
  const emit = jest.fn();
  fingerprintPlugin().init(emit);
  await new Promise(r => setTimeout(r, 200));
  expect(emit.mock.calls[0][1].audio).toBeNull();
});
