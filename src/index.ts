// @ts-ignore
import WebWorker from 'cerbero-worker:./worker/index.ts';
import { formatEvent } from './utils/formatter';

class Cerbero {
  private cerberoWorker: Worker;
  private textEncoder: TextEncoder = new TextEncoder();
  private startDate: number;
  private cb: Function;

  constructor() {
    if (typeof Worker === 'undefined') return null;
    this.startDate = Date.now();
    this.cerberoWorker = new WebWorker();
    this._initListener = this._initListener.bind(this);
    this._sendToWorker = this._sendToWorker.bind(this);
    this._receiveWorkerMessage = this._receiveWorkerMessage.bind(this);
    this._sendToWorker('performance', window.performance);
    this._initListener();
  }

  addEventListner = (cb: Function) => {
    this.cb = cb;
  }

  private _sendToWorker = (type: string, event: any, toFormat: boolean = true) => {
    let finalEvent = toFormat ? formatEvent(event) : event;
    finalEvent.startDate = this.startDate;
    finalEvent = this.textEncoder.encode(JSON.stringify(finalEvent));
    this.cerberoWorker.postMessage({ type, event: finalEvent });
  }

  private _receiveWorkerMessage = (event) => {
    if(this.cb) this.cb.apply(null, [event.data]);
    else throw new Error(`[Cerbero] no callback setted`);
  }

  private _initListener = () => {
    document.addEventListener('click', e => this._sendToWorker('click', e));
    window.addEventListener('mouseout', (e: any) => {
      const from = e.toElement;
      if ((!from || from.nodeName === 'HTML') && e.fromElement.nodeName !== 'HTML'){
        this._sendToWorker('mouseexit', e);
      }
    });

    this.cerberoWorker.onmessage = this._receiveWorkerMessage;
  }
}

export default new Cerbero();
