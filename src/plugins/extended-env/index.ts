import { CerberoPlugin, PluginEmitter } from '../../index';

const PERMISSION_NAMES = [
  'notifications',
  'geolocation',
  'camera',
  'microphone',
  'clipboard-read',
  'clipboard-write',
] as PermissionName[];

const queryPermissions = async (): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  for (const name of PERMISSION_NAMES) {
    try {
      const status = await navigator.permissions.query({ name });
      result[name] = status.state;
    } catch {
      result[name] = 'unsupported';
    }
  }
  return result;
};

const getMediaDeviceCounts = async (): Promise<{ video: number; audioIn: number; audioOut: number }> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      video: devices.filter(d => d.kind === 'videoinput').length,
      audioIn: devices.filter(d => d.kind === 'audioinput').length,
      audioOut: devices.filter(d => d.kind === 'audiooutput').length,
    };
  } catch {
    return { video: 0, audioIn: 0, audioOut: 0 };
  }
};

const getStorageEstimate = async (): Promise<{ used: number | null; quota: number | null }> => {
  try {
    const estimate = await navigator.storage.estimate();
    return { used: estimate.usage ?? null, quota: estimate.quota ?? null };
  } catch {
    return { used: null, quota: null };
  }
};

const getKeyboardLayout = async (): Promise<string | null> => {
  try {
    const kb = (navigator as Navigator & { keyboard?: { getLayoutMap(): Promise<Map<string, string>> } }).keyboard;
    if (!kb) return null;
    const layoutMap = await kb.getLayoutMap();
    return layoutMap.get('KeyQ') ?? null;
  } catch {
    return null;
  }
};

const getSpeechVoices = (): Promise<{ count: number; languages: string[] }> =>
  new Promise(resolve => {
    const collect = () => {
      const voices = speechSynthesis.getVoices();
      resolve({
        count: voices.length,
        languages: [...new Set(voices.map(v => v.lang))],
      });
    };
    if (speechSynthesis.getVoices().length > 0) {
      collect();
    } else {
      speechSynthesis.onvoiceschanged = collect;
      setTimeout(collect, 1000);
    }
  });

export const extendedEnvPlugin = (): CerberoPlugin => ({
  name: 'extendedEnv',
  init: (emit: PluginEmitter) => {
    Promise.all([
      queryPermissions(),
      getMediaDeviceCounts(),
      getStorageEstimate(),
      getKeyboardLayout(),
      getSpeechVoices(),
    ]).then(([permissions, mediaDevices, storage, keyboardLayout, speech]) => {
      emit('extendedEnv', {
        permissions,
        mediaDevices,
        storage,
        keyboardLayout,
        speechVoiceCount: speech.count,
        speechLanguages: speech.languages,
      });
    });
  },
});
