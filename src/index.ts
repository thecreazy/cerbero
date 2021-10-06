/* istanbul ignore file */
// @ts-ignore
import WebWorker from 'cerbero-worker:./worker/index.ts';
import {getCLS, getFCP, getFID, getLCP, getTTFB} from 'web-vitals'

import COSTANTS from './constants';
import { formatEvent } from './utils/formatter';
import SelectionObserver from './utils/selectionObserver';

const SCROLLING_TIMEOUT = 100;
class Cerbero {
  private cerberoWorker: Worker;
  private textEncoder: TextEncoder = new TextEncoder();
  private startDate: number;
  private isScrolling: any;
  private cb: Function;
  private timeInPageIntervalTime: number = 2500;
  private timeInPageInterval: any;

  constructor() {
    if (typeof Worker === 'undefined') return null;
    this.startDate = Date.now();
    this.cerberoWorker = new WebWorker();
    this._initListener = this._initListener.bind(this);
    this._sendToWorker = this._sendToWorker.bind(this);
    this._receiveWorkerMessage = this._receiveWorkerMessage.bind(this);
    this._receiveSelectionEvent = this._receiveSelectionEvent.bind(this);
    this._timeOnPage = this._timeOnPage.bind(this);
    this._initListener();
  }

  addEventListner = (cb: Function) => {
    this.cb = cb;
  }

  setTimeInPageInterval = (timeInPageIntervalTime: number) => {
    this.timeInPageIntervalTime = timeInPageIntervalTime;
    clearInterval(this.timeInPageInterval);
    this.timeInPageInterval = setInterval(this._timeOnPage, this.timeInPageIntervalTime);
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
    const from = event.toElement;
    if ((!from || from.nodeName === 'HTML') && event.fromElement.nodeName !== 'HTML'){
      this._sendToWorker(COSTANTS.events.mouseExit, event);
    }
  }

  private _timeOnPage = () => {
    this._sendToWorker(COSTANTS.events.timeInPage, {
      startTime: this.startDate,
      nowTime: Date.now(),
    });
  }

  private _initListener = () => {
    this._sendToWorker(COSTANTS.events.performance, window.performance);
    getCLS((data) => this._sendToWorker(COSTANTS.events.webVitals, data));
    getFCP((data) => this._sendToWorker(COSTANTS.events.webVitals, data));
    getFID((data) => this._sendToWorker(COSTANTS.events.webVitals, data));
    getLCP((data) => this._sendToWorker(COSTANTS.events.webVitals, data));
    getTTFB((data) => this._sendToWorker(COSTANTS.events.webVitals, data));
    document.addEventListener('click', e => this._sendToWorker('click', e));
    window.addEventListener('mouseout', this._receiveMouseOutEvent, false);
    const _selectionObserver = new SelectionObserver(this._receiveSelectionEvent);
    window.addEventListener('scroll', this._receiveScrollEvent, false);
    this.cerberoWorker.onmessage = this._receiveWorkerMessage;
    this.timeInPageInterval = setInterval(this._timeOnPage, this.timeInPageIntervalTime);
  }
}

export default new Cerbero();
