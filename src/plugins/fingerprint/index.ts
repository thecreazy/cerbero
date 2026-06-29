import { CerberoPlugin, PluginEmitter } from '../../index';

const hash = async (data: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const canvasFingerprint = async (): Promise<string | null> => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.textBaseline = 'alphabetic';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Cwm fjordbank glyphs vext quiz', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Cwm fjordbank glyphs vext quiz', 4, 17);
    return hash(canvas.toDataURL());
  } catch {
    return null;
  }
};

const webglFingerprint = async (): Promise<{ vendor: string | null; renderer: string | null; hash: string | null }> => {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return { vendor: null, renderer: null, hash: null };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const imgHash = await hash(vendor + '::' + renderer);
    return { vendor, renderer, hash: imgHash };
  } catch {
    return { vendor: null, renderer: null, hash: null };
  }
};

const audioFingerprint = async (): Promise<string | null> => {
  try {
    const AudioCtx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    oscillator.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(0);
    await new Promise(r => setTimeout(r, 100));
    const buffer = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(buffer);
    oscillator.stop();
    await ctx.close();
    return hash(buffer.join(','));
  } catch {
    return null;
  }
};

export const fingerprintPlugin = (): CerberoPlugin => ({
  name: 'fingerprint',
  init: (emit: PluginEmitter) => {
    Promise.all([
      canvasFingerprint(),
      webglFingerprint(),
      audioFingerprint(),
    ]).then(([canvas, webgl, audio]) => {
      emit('fingerprint', {
        canvas,
        webglVendor: webgl.vendor,
        webglRenderer: webgl.renderer,
        webglHash: webgl.hash,
        audio,
      });
    });
  },
});
