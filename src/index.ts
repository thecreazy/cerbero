// @ts-ignore
import WebWorker from 'cerbero-worker:./worker/index.ts';

class Cerbero {
  private cerberoWorker: Worker;
  private textEncoder: any;

  constructor() {
    if (typeof Worker === 'undefined') return null;
    this.cerberoWorker = new WebWorker();
    this.textEncoder = new TextEncoder();
    this.initListener = this.initListener.bind(this);
    this.sendToWorker = this.sendToWorker.bind(this);
    this.formatEvent = this.formatEvent.bind(this);
    this.sendToWorker('performance', window.performance);
    this.initListener();
  }

  private formatEvent = (e: any) => {
    const obj: any = {};
    for (const key in e) {
      if (e[key] instanceof window['InputDeviceCapabilities']) obj[key] = null;
      else if (typeof e[key] === 'function') obj[key] = null;
      else if (e[key] instanceof Node) obj[key] = 'Node';
      else if (e[key] instanceof Window) obj[key] = 'Window';
      else obj[key] = e[key];
    }
    obj['path'] = null;
    return { ...obj };
  }

  private sendToWorker = (type: string, event: any, toFormat: boolean = false) => {
    let finalEvent = toFormat ? this.formatEvent(event) : event;
    finalEvent = this.textEncoder.encode(JSON.stringify(finalEvent));

    this.cerberoWorker.postMessage({ type, event: finalEvent });
  }

  private initListener = () => {
    document.addEventListener('click', e => this.sendToWorker('click', e, true));
  }
}

export default new Cerbero();
