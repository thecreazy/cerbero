/* istanbul ignore file */
// @ts-expect-error — custom rollup plugin resolves this import at build time
import WebWorker from 'cerbero-worker:./worker/index.ts';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

import COSTANTS from './constants';
import { formatEvent } from './utils/formatter';
import SelectionObserver from './utils/selectionObserver';

interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

interface NavigatorExtended extends Navigator {
  connection?: NetworkInformation;
  deviceMemory?: number;
  userAgentData?: {
    mobile: boolean;
    platform: string;
    brands: Array<{ brand: string; version: string }>;
  };
  globalPrivacyControl?: boolean;
  ml?: unknown;
}

interface ChromeAICapabilities {
  available: string;
}

interface ChromeAILanguageModel {
  capabilities(): Promise<ChromeAICapabilities>;
}

interface ChromeAI {
  languageModel?: ChromeAILanguageModel;
}

interface NavigateEvent {
  destination: { url: string };
  navigationType: string;
}

interface NavigationEventTarget {
  addEventListener(type: 'navigate', listener: (e: NavigateEvent) => void): void;
  removeEventListener(type: 'navigate', listener: (e: NavigateEvent) => void): void;
}

interface ClickBuffer {
  target: EventTarget | null;
  time: number;
}

const SCROLLING_TIMEOUT = 100;
const RAGE_CLICK_WINDOW_MS = 500;
const RAGE_CLICK_THRESHOLD = 3;

class Cerbero {
  private cerberoWorker: Worker;
  private textEncoder: TextEncoder = new TextEncoder();
  private startDate: number;
  private isScrolling: ReturnType<typeof setTimeout> | null = null;
  private cb: ((event: unknown) => void) | null = null;
  private timeInPageIntervalTime: number = 2500;
  private timeInPageInterval: ReturnType<typeof setInterval> | null = null;
  private _clickHandler: (e: PointerEvent) => void;
  private _networkChangeHandler: (() => void) | null = null;
  private _longTaskObserver: PerformanceObserver | null = null;
  private _slowResourceObserver: PerformanceObserver | null = null;
  private _orientationChangeHandler: (() => void) | null = null;
  private _intersectionObserver: IntersectionObserver | null = null;
  private _navigateHandler: ((e: { destination: { url: string }; navigationType: string }) => void) | null = null;
  private _popstateHandler: (() => void) | null = null;
  private _hashchangeHandler: (() => void) | null = null;
  private _keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private _pagehideHandler: (() => void) | null = null;
  private _clickBuffer: ClickBuffer[] = [];

  constructor() {
    if (typeof Worker === 'undefined') return null;
    this.startDate = Date.now();
    this.cerberoWorker = new WebWorker();
    this._clickHandler = (e: PointerEvent) => this._handlePointerUp(e);
    this._initListener = this._initListener.bind(this);
    this._sendToWorker = this._sendToWorker.bind(this);
    this._receiveWorkerMessage = this._receiveWorkerMessage.bind(this);
    this._receiveSelectionEvent = this._receiveSelectionEvent.bind(this);
    this._timeOnPage = this._timeOnPage.bind(this);
    this._initListener();
  }

  addEventListener = (cb: (event: unknown) => void) => {
    this.cb = cb;
  }

  /** @deprecated Use addEventListener() instead. Will be removed in the next major version. */
  addEventListner = (cb: (event: unknown) => void) => {
    this.addEventListener(cb);
  }

  setTimeInPageInterval = (timeInPageIntervalTime: number) => {
    this.timeInPageIntervalTime = timeInPageIntervalTime;
    clearInterval(this.timeInPageInterval);
    this.timeInPageInterval = setInterval(this._timeOnPage, this.timeInPageIntervalTime);
  }

  observeElements = (selector: string) => {
    if (!('IntersectionObserver' in window)) return;
    if (this._intersectionObserver) this._intersectionObserver.disconnect();
    this._intersectionObserver = new IntersectionObserver((entries) => {
      entries.filter(e => e.isIntersecting).forEach(entry => {
        this._sendToWorker(COSTANTS.events.elementVisible, {
          selector,
          element: formatEvent(entry.target as unknown as object),
          visibleRatio: entry.intersectionRatio,
        }, false);
      });
    }, { threshold: [0.5] });
    document.querySelectorAll(selector).forEach(el => {
      this._intersectionObserver!.observe(el);
    });
  }

  destroy = () => {
    clearInterval(this.timeInPageInterval);
    if (this.isScrolling) window.clearTimeout(this.isScrolling);
    document.removeEventListener('pointerup', this._clickHandler);
    window.removeEventListener('mouseout', this._receiveMouseOutEvent);
    window.removeEventListener('scroll', this._receiveScrollEvent);
    document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    if (this._pagehideHandler) window.removeEventListener('pagehide', this._pagehideHandler);
    const conn = (navigator as NavigatorExtended).connection;
    if (conn && this._networkChangeHandler) conn.removeEventListener('change', this._networkChangeHandler);
    this._longTaskObserver?.disconnect();
    this._slowResourceObserver?.disconnect();
    this._intersectionObserver?.disconnect();
    if (screen.orientation && this._orientationChangeHandler) {
      screen.orientation.removeEventListener('change', this._orientationChangeHandler);
    }
    const nav = (window as Window & { navigation?: NavigationEventTarget }).navigation;
    if (nav && this._navigateHandler) nav.removeEventListener('navigate', this._navigateHandler);
    if (this._popstateHandler) window.removeEventListener('popstate', this._popstateHandler);
    if (this._hashchangeHandler) window.removeEventListener('hashchange', this._hashchangeHandler);
    if (this._keydownHandler) document.removeEventListener('keydown', this._keydownHandler);
    this.cerberoWorker.terminate();
    this.cb = null;
  }

  private _sendToWorker = (type: string, event: object, toFormat: boolean = true) => {
    const eventData: Record<string, unknown> = toFormat
      ? formatEvent(event)
      : { ...(event as Record<string, unknown>) };
    eventData.startDate = this.startDate;
    const encoded = this.textEncoder.encode(JSON.stringify(eventData));
    this.cerberoWorker.postMessage({ type, event: encoded });
  }

  private _receiveWorkerMessage = (event: MessageEvent) => {
    if(!this.cb) throw new Error(`[Cerbero] no callback setted`);
    this.cb.apply(null, [event.data]);
  }

  private _receiveSelectionEvent = (data: { event: Selection; text: string }) => {
    this._sendToWorker(COSTANTS.events.selection, {
      event: formatEvent(data.event),
      selection: data.text,
    }, false);
  }

  private _receiveScrollEvent = (event: Event) => {
    const { body, documentElement : html } = document;
    window.clearTimeout(this.isScrolling);
    this.isScrolling = setTimeout(() => {
      const height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);
      this._sendToWorker(COSTANTS.events.scroll, {
        event: formatEvent(event),
        height,
        scroll: window.scrollY || window.pageYOffset,
      }, false);
    }, SCROLLING_TIMEOUT);
  }

  private _receiveMouseOutEvent = (event: MouseEvent) => {
    const to = event.relatedTarget as Element | null;
    if ((!to || to.nodeName === 'HTML') && (event.target as Element).nodeName !== 'HTML') {
      this._sendToWorker(COSTANTS.events.mouseExit, event);
    }
  }

  private _handlePointerUp = (event: PointerEvent) => {
    this._sendToWorker(COSTANTS.events.click, event);
    this._checkRageClick(event);
  }

  private _checkRageClick = (event: PointerEvent) => {
    const now = Date.now();
    this._clickBuffer = this._clickBuffer.filter(c => now - c.time < RAGE_CLICK_WINDOW_MS);
    this._clickBuffer.push({ target: event.target, time: now });
    const sameTargetClicks = this._clickBuffer.filter(c => c.target === event.target);
    if (sameTargetClicks.length >= RAGE_CLICK_THRESHOLD) {
      this._sendToWorker(COSTANTS.events.rageClick, {
        count: sameTargetClicks.length,
        target: formatEvent(event.target as object),
      }, false);
      this._clickBuffer = [];
    }
  }

  private _timeOnPage = () => {
    this._sendToWorker(COSTANTS.events.timeInPage, {
      startTime: this.startDate,
      nowTime: Date.now(),
    });
  }

  private _handleVisibilityChange = () => {
    if (document.hidden) {
      clearInterval(this.timeInPageInterval);
      this.timeInPageInterval = null;
    } else {
      this.timeInPageInterval = setInterval(this._timeOnPage, this.timeInPageIntervalTime);
    }
  }

  private _initPerformance = () => {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      this._sendToWorker(COSTANTS.events.performance, navEntries[0], false);
      return;
    }
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceNavigationTiming[];
      if (entries.length > 0) {
        this._sendToWorker(COSTANTS.events.performance, entries[0], false);
        observer.disconnect();
      }
    });
    observer.observe({ type: 'navigation', buffered: true });
  }

  private _initPrivacySignals = (): boolean => {
    const nav = navigator as NavigatorExtended;
    const gpc = nav.globalPrivacyControl ?? null;
    const doNotTrack = navigator.doNotTrack === '1';
    const gpcAutoDisabled = gpc === true;

    this._sendToWorker(COSTANTS.events.privacySignals, { gpc, doNotTrack, gpcAutoDisabled }, false);

    if (gpcAutoDisabled) {
      this.destroy();
      return false;
    }
    return true;
  }

  private _collectEnvironment = () => {
    const dtf = Intl.DateTimeFormat().resolvedOptions();
    const nav = navigator as NavigatorExtended;
    const uaData = nav.userAgentData ?? null;

    this._sendToWorker(COSTANTS.events.environment, {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(forced-colors: active)').matches,
      moreContrast: window.matchMedia('(prefers-contrast: more)').matches,
      forcedColors: window.matchMedia('(forced-colors: active)').matches,
      colorGamut: window.matchMedia('(color-gamut: p3)').matches ? 'p3'
        : window.matchMedia('(color-gamut: srgb)').matches ? 'srgb' : 'unknown',
      cpuCores: navigator.hardwareConcurrency ?? null,
      deviceMemory: nav.deviceMemory ?? null,
      devicePixelRatio: window.devicePixelRatio,
      colorDepth: screen.colorDepth,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.visualViewport?.width ?? window.innerWidth,
      viewportHeight: window.visualViewport?.height ?? window.innerHeight,
      maxTouchPoints: navigator.maxTouchPoints,
      pointerType: window.matchMedia('(pointer: fine)').matches ? 'mouse'
        : window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'none',
      hasHover: window.matchMedia('(hover: hover)').matches,
      hasAnyTouch: window.matchMedia('(any-pointer: coarse)').matches,
      hasWebShare: 'share' in navigator,
      referrer: document.referrer || null,
      historyLength: window.history.length,
      isIframe: window !== window.top,
      isOpenedByScript: window.opener !== null,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      visibilityAtLoad: document.visibilityState,
      timezone: dtf.timeZone,
      language: navigator.language,
      languages: Array.from(navigator.languages),
      hourCycle: (dtf as Intl.ResolvedDateTimeFormatOptions & { hourCycle?: string }).hourCycle ?? null,
      serviceWorker: 'serviceWorker' in navigator,
      webAssembly: typeof WebAssembly !== 'undefined',
      ua: uaData,
    }, false);
  }

  private _collectNetwork = () => {
    const conn = (navigator as NavigatorExtended).connection;
    if (!conn) return;
    this._sendToWorker(COSTANTS.events.network, {
      effectiveType: conn.effectiveType,
      downlink: conn.downlink,
      rtt: conn.rtt,
      saveData: conn.saveData,
    }, false);
  }

  private _initNetwork = () => {
    const conn = (navigator as NavigatorExtended).connection;
    if (!conn) return;
    this._collectNetwork();
    this._networkChangeHandler = () => this._collectNetwork();
    conn.addEventListener('change', this._networkChangeHandler);
  }

  private _initLongTaskObserver = () => {
    if (!PerformanceObserver.supportedEntryTypes?.includes('longtask')) return;
    this._longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this._sendToWorker(COSTANTS.events.longTask, {
          duration: entry.duration,
          startTime: entry.startTime,
        }, false);
      });
    });
    this._longTaskObserver.observe({ type: 'longtask', buffered: true });
  }

  private _initSlowResourceObserver = () => {
    if (!PerformanceObserver.supportedEntryTypes?.includes('resource')) return;
    this._slowResourceObserver = new PerformanceObserver((list) => {
      list.getEntries()
        .filter(e => e.duration > 1000)
        .forEach(e => {
          this._sendToWorker(COSTANTS.events.slowResource, {
            name: e.name,
            duration: e.duration,
            initiatorType: (e as PerformanceResourceTiming).initiatorType,
            startTime: e.startTime,
          }, false);
        });
    });
    this._slowResourceObserver.observe({ type: 'resource', buffered: true });
  }

  private _initOrientationObserver = () => {
    if (!screen.orientation) return;
    this._orientationChangeHandler = () => {
      this._sendToWorker(COSTANTS.events.orientationChange, {
        orientationType: screen.orientation.type,
        angle: screen.orientation.angle,
      }, false);
    };
    screen.orientation.addEventListener('change', this._orientationChangeHandler);
  }

  private _collectBrowserAI = async () => {
    const ai = (window as Window & { ai?: ChromeAI }).ai;
    const hasChromeAI = ai !== undefined;
    let chromeAIModel: string | null = null;

    if (hasChromeAI && ai.languageModel) {
      try {
        const cap = await ai.languageModel.capabilities();
        chromeAIModel = cap?.available ?? null;
      } catch {
        chromeAIModel = null;
      }
    }

    this._sendToWorker(COSTANTS.events.browserAI, {
      hasChromeAI,
      chromeAIModel,
      hasWebNN: (navigator as NavigatorExtended).ml !== undefined,
    }, false);
  }

  private _initNavigation = () => {
    const nav = (window as Window & { navigation?: NavigationEventTarget }).navigation;
    if (nav) {
      this._navigateHandler = (e: { destination: { url: string }; navigationType: string }) => {
        this._sendToWorker(COSTANTS.events.navigation, {
          from: window.location.href,
          to: e.destination.url,
          navigationType: e.navigationType,
        }, false);
      };
      nav.addEventListener('navigate', this._navigateHandler);
      return;
    }
    let lastUrl = window.location.href;
    const report = (type: string) => {
      const to = window.location.href;
      this._sendToWorker(COSTANTS.events.navigation, { from: lastUrl, to, navigationType: type }, false);
      lastUrl = to;
    };
    this._popstateHandler = () => report('pop');
    this._hashchangeHandler = () => report('hash');
    window.addEventListener('popstate', this._popstateHandler);
    window.addEventListener('hashchange', this._hashchangeHandler);
  }

  private _initPageUnload = () => {
    this._pagehideHandler = () => {
      this._sendToWorker(COSTANTS.events.pageUnload, {
        startDate: this.startDate,
        timeOnPage: Date.now() - this.startDate,
      }, false);
    };
    window.addEventListener('pagehide', this._pagehideHandler);
  }

  private _initKeyboardShortcuts = () => {
    this._keydownHandler = (e: KeyboardEvent) => {
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
      if (!hasModifier) return;
      const modifiers: string[] = [];
      if (e.ctrlKey) modifiers.push('ctrl');
      if (e.metaKey) modifiers.push('meta');
      if (e.altKey) modifiers.push('alt');
      if (e.shiftKey) modifiers.push('shift');
      const combo = [...modifiers, e.key.toLowerCase()].join('+');
      this._sendToWorker(COSTANTS.events.keyboardShortcut, {
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        combo,
      }, false);
    };
    document.addEventListener('keydown', this._keydownHandler);
  }

  private _initListener = () => {
    if (!this._initPrivacySignals()) return;
    this._initPerformance();
    this._collectEnvironment();
    this._initNetwork();
    this._initLongTaskObserver();
    this._initSlowResourceObserver();
    this._initOrientationObserver();
    this._collectBrowserAI();
    this._initNavigation();
    this._initPageUnload();
    this._initKeyboardShortcuts();
    onCLS(data => this._sendToWorker(COSTANTS.events.webVitals, data));
    onFCP(data => this._sendToWorker(COSTANTS.events.webVitals, data));
    onINP(data => this._sendToWorker(COSTANTS.events.webVitals, data));
    onLCP(data => this._sendToWorker(COSTANTS.events.webVitals, data));
    onTTFB(data => this._sendToWorker(COSTANTS.events.webVitals, data));
    document.addEventListener('pointerup', this._clickHandler);
    window.addEventListener('mouseout', this._receiveMouseOutEvent, false);
    new SelectionObserver(this._receiveSelectionEvent);
    window.addEventListener('scroll', this._receiveScrollEvent, false);
    document.addEventListener('visibilitychange', this._handleVisibilityChange);
    this.cerberoWorker.onmessage = this._receiveWorkerMessage;
    this.timeInPageInterval = setInterval(this._timeOnPage, this.timeInPageIntervalTime);
  }
}

export default new Cerbero();
