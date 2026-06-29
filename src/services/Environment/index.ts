import COSTANTS from '../../constants';

interface UAData {
  mobile: boolean;
  platform: string;
  brands: Array<{ brand: string; version: string }>;
}

interface EnvironmentInput {
  darkMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  moreContrast: boolean;
  forcedColors: boolean;
  colorGamut: string;
  cpuCores: number | null;
  deviceMemory: number | null;
  devicePixelRatio: number;
  colorDepth: number;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  maxTouchPoints: number;
  pointerType: string;
  hasHover: boolean;
  hasAnyTouch: boolean;
  hasWebShare: boolean;
  referrer: string | null;
  historyLength: number;
  isIframe: boolean;
  isOpenedByScript: boolean;
  isStandalone: boolean;
  visibilityAtLoad: DocumentVisibilityState;
  timezone: string;
  language: string;
  languages: string[];
  hourCycle: string | null;
  serviceWorker: boolean;
  webAssembly: boolean;
  ua: UAData | null;
  startDate?: number;
}

class Environment {
  static formatEvent = (data: EnvironmentInput) => ({
    type: COSTANTS.events.environment,
    time: Date.now(),
    data: {
      preferences: {
        darkMode: data.darkMode,
        reducedMotion: data.reducedMotion,
        highContrast: data.highContrast,
        moreContrast: data.moreContrast,
        forcedColors: data.forcedColors,
        colorGamut: data.colorGamut,
      },
      device: {
        cpuCores: data.cpuCores,
        deviceMemory: data.deviceMemory,
        devicePixelRatio: data.devicePixelRatio,
        colorDepth: data.colorDepth,
        screenWidth: data.screenWidth,
        screenHeight: data.screenHeight,
        viewportWidth: data.viewportWidth,
        viewportHeight: data.viewportHeight,
      },
      input: {
        maxTouchPoints: data.maxTouchPoints,
        pointerType: data.pointerType,
        hasHover: data.hasHover,
        hasAnyTouch: data.hasAnyTouch,
        hasWebShare: data.hasWebShare,
      },
      session: {
        referrer: data.referrer,
        historyLength: data.historyLength,
        isIframe: data.isIframe,
        isOpenedByScript: data.isOpenedByScript,
        isStandalone: data.isStandalone,
        visibilityAtLoad: data.visibilityAtLoad,
      },
      locale: {
        timezone: data.timezone,
        language: data.language,
        languages: data.languages,
        hourCycle: data.hourCycle,
      },
      capabilities: {
        serviceWorker: data.serviceWorker,
        webAssembly: data.webAssembly,
      },
      ua: data.ua,
    },
  })
}

export default Environment;
