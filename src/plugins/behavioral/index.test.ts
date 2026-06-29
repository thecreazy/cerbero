import { behavioralPlugin } from './index';

let perfTime = 0;
beforeEach(() => {
  perfTime = 0;
  jest.useFakeTimers();
  jest.spyOn(performance, 'now').mockImplementation(() => { perfTime += 100; return perfTime; });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('[behavioralPlugin] uses default options when called with no arguments', () => {
  const emit = jest.fn();
  const cleanup = behavioralPlugin().init(emit);
  // Defaults: mouseDynamics=true, keystrokeDynamics=true, emitInterval=5000
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0, bubbles: true }));
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 0, bubbles: true }));
  jest.advanceTimersByTime(5000);
  expect(emit).toHaveBeenCalledWith('mouseDynamics', expect.any(Object));
  if (typeof cleanup === 'function') cleanup();
});

test('[behavioralPlugin] emits mouseDynamics after interval', () => {
  const emit = jest.fn();
  const cleanup = behavioralPlugin({ mouseDynamics: true, keystrokeDynamics: false, emitInterval: 1000 }).init(emit);

  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0, bubbles: true }));
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 0, bubbles: true }));
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 0, bubbles: true }));

  jest.advanceTimersByTime(1000);
  expect(emit).toHaveBeenCalledWith('mouseDynamics', expect.objectContaining({
    avgVelocity: expect.any(Number),
    maxVelocity: expect.any(Number),
    avgAcceleration: expect.any(Number),
    sampleCount: expect.any(Number),
  }));
  if (typeof cleanup === 'function') cleanup();
});

test('[behavioralPlugin] acceleration is 0 with only one velocity sample', () => {
  const emit = jest.fn();
  const cleanup = behavioralPlugin({ mouseDynamics: true, keystrokeDynamics: false, emitInterval: 1000 }).init(emit);

  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0, bubbles: true }));
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 0, bubbles: true }));

  jest.advanceTimersByTime(1000);
  const data = emit.mock.calls[0]?.[1];
  expect(data.avgAcceleration).toBe(0);
  if (typeof cleanup === 'function') cleanup();
});

test('[behavioralPlugin] emits keystrokeDynamics after interval', () => {
  const emit = jest.fn();
  const cleanup = behavioralPlugin({ mouseDynamics: false, keystrokeDynamics: true, emitInterval: 1000 }).init(emit);

  document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true }));
  document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', bubbles: true }));
  document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB', bubbles: true }));
  document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyB', bubbles: true }));

  jest.advanceTimersByTime(1000);
  expect(emit).toHaveBeenCalledWith('keystrokeDynamics', expect.objectContaining({
    avgDwellTime: expect.any(Number),
    avgFlightTime: expect.any(Number),
    keyCount: 2,
  }));
  if (typeof cleanup === 'function') cleanup();
});

test('[behavioralPlugin] flight time is 0 for first key release (no prior keyup)', () => {
  const emit = jest.fn();
  const cleanup = behavioralPlugin({ mouseDynamics: false, keystrokeDynamics: true, emitInterval: 1000 }).init(emit);

  document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true }));
  document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', bubbles: true }));

  jest.advanceTimersByTime(1000);
  expect(emit.mock.calls[0]?.[1].avgFlightTime).toBe(0);
  if (typeof cleanup === 'function') cleanup();
});

test('[behavioralPlugin] repeated keydown for same key does not double-register', () => {
  const emit = jest.fn();
  const cleanup = behavioralPlugin({ mouseDynamics: false, keystrokeDynamics: true, emitInterval: 1000 }).init(emit);

  document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true }));
  document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true })); // repeat, ignored
  document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', bubbles: true }));

  jest.advanceTimersByTime(1000);
  expect(emit.mock.calls[0]?.[1].keyCount).toBe(1);
  if (typeof cleanup === 'function') cleanup();
});

test('[behavioralPlugin] cleanup removes all listeners and intervals', () => {
  const emit = jest.fn();
  const cleanup = behavioralPlugin({ emitInterval: 1000 }).init(emit);
  if (typeof cleanup === 'function') cleanup();
  jest.advanceTimersByTime(5000);
  expect(emit).not.toHaveBeenCalled();
});

test('[behavioralPlugin] does not emit when no events occurred in interval', () => {
  const emit = jest.fn();
  const cleanup = behavioralPlugin({ emitInterval: 1000 }).init(emit);
  jest.advanceTimersByTime(1000);
  expect(emit).not.toHaveBeenCalled();
  if (typeof cleanup === 'function') cleanup();
});
