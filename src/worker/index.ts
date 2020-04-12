import { CerberoEventStructure, CerberoMessageStructure } from './index.d';
import ClickService from '../services/Click';

class MasterWorker {
  private self: any;
  private textDecoder: TextDecoder = new TextDecoder();

  constructor() {
    this.self = self;
    this.self.addEventListener('message', this.onMessage.bind(this));
    this.onMessage = this.onMessage.bind(this);
  }

  private onMessage = (e: CerberoMessageStructure) => {
    const { data } : {data : CerberoEventStructure} = e;
    const { type, event } = data;
    const eventDecoded = JSON.parse(this.textDecoder.decode(event));
    switch(type) {
      case 'click':{
        const formatted = ClickService.formatEvent(e);
        break;
      }
      default: break;
    }
  }
}

const masterWorker = new MasterWorker();
