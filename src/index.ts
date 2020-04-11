// @ts-ignore
import WebWorker from 'cerbero-worker:./worker/Worker.ts';


class Cerbero {
  private cerberoWorker: Worker;

  constructor() {
      if (typeof Worker === 'undefined') return null;
      this.cerberoWorker = new WebWorker();
    }
}

export default new Cerbero;
