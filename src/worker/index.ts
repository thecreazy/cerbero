import { CerberoEventStructure, CerberoMessageStructure } from './index.d';

class MasterWorker {
  constructor() {
    self.addEventListener('message', this.onMessage.bind(this));
  }

  onMessage = (e: CerberoMessageStructure) => {
    const { data } : {data : CerberoEventStructure} = e;
    const { type, event } = data;
    const textDecoder = new TextDecoder();
    console.log(type, JSON.parse(textDecoder.decode(event)));
  }
}

const masterWorker = new MasterWorker();
