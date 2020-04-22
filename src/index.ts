// @ts-ignore
import WebWorker from 'cerbero-worker:./worker/index.ts';
import { NodeStructure } from './index.d';

class Cerbero {
  private cerberoWorker: Worker;
  private textEncoder: TextEncoder = new TextEncoder();
  private cb: Function;

  constructor() {
    if (typeof Worker === 'undefined') return null;
    this.cerberoWorker = new WebWorker();
    this._initListener = this._initListener.bind(this);
    this._sendToWorker = this._sendToWorker.bind(this);
    this._formatEvent = this._formatEvent.bind(this);
    this._formatNode = this._formatNode.bind(this);
    this._calculateDomStructure = this._calculateDomStructure.bind(this);
    this._receiveWorkerMessage = this._receiveWorkerMessage.bind(this);
    this._sendToWorker('performance', window.performance);
    this._initListener();
  }

  addEventListner = (cb: Function) => {
    this.cb = cb;
  }

  private _getDomNode = (element: NodeStructure) => {
    const { id,nodeName } = element;
    return `${nodeName.toLowerCase()}${id? `#${id}`: ''}`;
  }

  private _calculateDomStructure = (element: NodeStructure) => {
    let prevElment: string = '';
    if(element.parentElement) prevElment = this._calculateDomStructure(element.parentElement);
    return `${prevElment} > ${this._getDomNode(element)}`;
  }

  private _formatNode = (element: NodeStructure) => {
    const { id, name, nodeName, constructor, className, getBoundingClientRect } = element;
    return {
      id,
      name,
      className,
      type: nodeName,
      domType: constructor.name,
      identifier: this._getDomNode(element),
      domStructure: this._calculateDomStructure(element),
      position: getBoundingClientRect ? element.getBoundingClientRect() : {},
    };
  }

  private _formatEvent = (e: any) => {
    const obj: any = {};
    for (const key in e) {
      if (e[key] instanceof Node) obj[key] = this._formatNode(e[key]);
      else if (e[key] instanceof Window) obj[key] = 'Window';
      else if(e[key] instanceof window['InputDeviceCapabilities'] === false && typeof e[key] !== 'function') obj[key] = e[key];
    }
    obj['path'] = null;
    return { ...obj };
  }

  private _sendToWorker = (type: string, event: any, toFormat: boolean = false) => {
    let finalEvent = toFormat ? this._formatEvent(event) : event;
    finalEvent = this.textEncoder.encode(JSON.stringify(finalEvent));
    this.cerberoWorker.postMessage({ type, event: finalEvent });
  }

  private _receiveWorkerMessage = (event) => {
    if(this.cb) this.cb.apply(null, [event.data]);
    else throw new Error(`[Cerbero] no callback setted`);
  }

  private _initListener = () => {
    document.addEventListener('click', e => this._sendToWorker('click', e, true));
    this.cerberoWorker.onmessage = this._receiveWorkerMessage;
  }
}

export default new Cerbero();
