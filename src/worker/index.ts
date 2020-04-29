import { CerberoEventStructure, CerberoMessageStructure, FormattedMessageStructure } from './index.d';
import ClickService from '../services/Click';
import PerformanceService from '../services/Performance';
import MouseExitService from '../services/MouseExit';
import SelectionService from '../services/Selection';

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
    let formatted: FormattedMessageStructure;
    switch(type) {
      case 'click':{
        formatted = ClickService.formatEvent(eventDecoded);
        break;
      }
      case 'performance': {
        formatted = PerformanceService.formatEvent(eventDecoded);
        break;
      }
      case 'mouseexit': {
        formatted = MouseExitService.formatEvent(eventDecoded);
        break;
      }
      case 'selection': {
        formatted = SelectionService.formatEvent(eventDecoded);
        break;
      }
      default: break;
    }

    if(formatted) postMessage(formatted, null);
  }
}

const masterWorker = new MasterWorker();
