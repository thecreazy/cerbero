/* istanbul ignore file */
// @ts-expect-error — custom rollup plugin resolves this import at build time
import WebWorker from 'cerbero-worker:./worker/index.ts';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

import COSTANTS from './constants';
import { formatEvent } from './utils/formatter';
import SelectionObserver from './utils/selectionObserver';

const SCROLLING_TIMEOUT = 100;
class Cerbero {
  private cerberoWorker: Worker;
  private textEncoder: TextEncoder = new TextEncoder();
  private startDate: number;
  private isScrolling: any;
  private cb: ((event: unknown) => void) | null = null;
  private timeInPageIntervalTime: number = 2500;
  private timeInPageInterval: any;
  private _clickHandler: (e: MouseEvent) => void;

  constructor() {
    if (typeof Worker === 'undefined') return null;
    this.startDate = Date.now();
    this.cerberoWorker = new WebWorker();
    this._clickHandler = (e: MouseEvent) => this._sendToWorker('click', e);
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

  destroy = () => {
    clearInterval(this.timeInPageInterval);
    if (this.isScrolling) window.clearTimeout(this.isScrolling);
    document.removeEventListener('click', this._clickHandler);
    window.removeEventListener('mouseout', this._receiveMouseOutEvent);
    window.removeEventListener('scroll', this._receiveScrollEvent);
    document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    this.cerberoWorker.terminate();
    this.cb = null;
  }

  private _sendToWorker = (type: string, event: any, toFormat: boolean = true) => {
    let finalEvent = toFormat ? formatEvent(event) : event;
    finalEvent.startDate = this.startDate;
    finalEvent = this.textEncoder.encode(JSON.stringify(finalEvent));
    this.cerberoWorker.postMessage({ type, event: finalEvent });
  }

  private _receiveWorkerMessage = (event: any) => {
    if(!this.cb) throw new Error(`[Cerbero] no callback setted`);
    this.cb.apply(null, [event.data]);
  }

  private _receiveSelectionEvent = (data: any) => {
    this._sendToWorker(COSTANTS.events.selection, {
      event: formatEvent(data.event),
      selection: data.text,
    }, false);
  }

  private _receiveScrollEvent = (event: any) => {
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

  private _receiveMouseOutEvent = (event: any) => {
    const to = event.relatedTarget as Element | null;
    if ((!to || to.nodeName === 'HTML') && (event.target as Element).nodeName !== 'HTML') {
      this._sendToWorker(COSTANTS.events.mouseExit, event);
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
    // Entry may not be ready at init time — observe with buffered:true as fallback
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceNavigationTiming[];
      if (entries.length > 0) {
        this._sendToWorker(COSTANTS.events.performance, entries[0], false);
        observer.disconnect();
      }
    });
    observer.observe({ type: 'navigation', buffered: true });
  }

  private _initListener = () => {
    this._initPerformance();
    onCLS(data => this._sendToWorker(COSTANTS.events.webVitals, data));
    onFCP(data => this._sendToWorker(COSTANTS.events.webVitals, data));
    onINP(data => this._sendToWorker(COSTANTS.events.webVitals, data));
    onLCP(data => this._sendToWorker(COSTANTS.events.webVitals, data));
    onTTFB(data => this._sendToWorker(COSTANTS.events.webVitals, data));
    document.addEventListener('click', this._clickHandler);
    window.addEventListener('mouseout', this._receiveMouseOutEvent, false);
    new SelectionObserver(this._receiveSelectionEvent);
    window.addEventListener('scroll', this._receiveScrollEvent, false);
    document.addEventListener('visibilitychange', this._handleVisibilityChange);
    this.cerberoWorker.onmessage = this._receiveWorkerMessage;
    this.timeInPageInterval = setInterval(this._timeOnPage, this.timeInPageIntervalTime);
  }
}

export default new Cerbero();
