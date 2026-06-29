import { CerberoPlugin, PluginEmitter } from '../../index';

export interface BehavioralOptions {
  mouseDynamics?: boolean;
  keystrokeDynamics?: boolean;
  emitInterval?: number;
}

const avg = (arr: number[]): number => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
const max = (arr: number[]): number => Math.max(0, ...arr);

const initMouseDynamics = (emit: PluginEmitter, interval: number): (() => void) => {
  let lastX = 0, lastY = 0, lastTime = 0;
  const velocities: number[] = [];
  const accelerations: number[] = [];

  const onMouseMove = (e: MouseEvent) => {
    const now = performance.now();
    if (lastTime > 0) {
      const dt = now - lastTime;
      if (dt > 0) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const velocity = Math.sqrt(dx * dx + dy * dy) / dt;
        if (velocities.length > 0) {
          accelerations.push((velocity - velocities[velocities.length - 1]) / dt);
        }
        velocities.push(velocity);
      }
    }
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;
  };

  document.addEventListener('mousemove', onMouseMove, { passive: true });

  const timer = setInterval(() => {
    if (velocities.length === 0) return;
    emit('mouseDynamics', {
      avgVelocity: avg(velocities),
      maxVelocity: max(velocities),
      avgAcceleration: avg(accelerations),
      sampleCount: velocities.length,
    });
    velocities.length = 0;
    accelerations.length = 0;
  }, interval);

  return () => {
    document.removeEventListener('mousemove', onMouseMove);
    clearInterval(timer);
  };
};

const initKeystrokeDynamics = (emit: PluginEmitter, interval: number): (() => void) => {
  const pressStart = new Map<string, number>();
  const dwellTimes: number[] = [];
  const flightTimes: number[] = [];
  let lastKeyUpTime = 0;

  const onKeyDown = (e: KeyboardEvent) => {
    if (!pressStart.has(e.code)) {
      pressStart.set(e.code, performance.now());
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const now = performance.now();
    const down = pressStart.get(e.code);
    if (down !== undefined) {
      dwellTimes.push(now - down);
      pressStart.delete(e.code);
    }
    if (lastKeyUpTime > 0) {
      flightTimes.push(now - lastKeyUpTime);
    }
    lastKeyUpTime = now;
  };

  document.addEventListener('keydown', onKeyDown, { passive: true });
  document.addEventListener('keyup', onKeyUp, { passive: true });

  const timer = setInterval(() => {
    if (dwellTimes.length === 0) return;
    emit('keystrokeDynamics', {
      avgDwellTime: avg(dwellTimes),
      avgFlightTime: avg(flightTimes),
      keyCount: dwellTimes.length,
    });
    dwellTimes.length = 0;
    flightTimes.length = 0;
  }, interval);

  return () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    clearInterval(timer);
  };
};

export const behavioralPlugin = (options: BehavioralOptions = {}): CerberoPlugin => {
  const {
    mouseDynamics = true,
    keystrokeDynamics = true,
    emitInterval = 5000,
  } = options;

  return {
    name: 'behavioral',
    init: (emit: PluginEmitter) => {
      const cleanups: Array<() => void> = [];
      if (mouseDynamics) cleanups.push(initMouseDynamics(emit, emitInterval));
      if (keystrokeDynamics) cleanups.push(initKeystrokeDynamics(emit, emitInterval));
      return () => cleanups.forEach(fn => fn());
    },
  };
};
