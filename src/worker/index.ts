/* istanbul ignore file */

import { CerberoEventStructure, CerberoMessageStructure, FormattedMessageStructure } from './index.d';
import ClickService from '../services/Click';
import PerformanceService from '../services/Performance';
import MouseExitService from '../services/MouseExit';
import SelectionService from '../services/Selection';
import ScrollService from '../services/Scroll';
import TimeInPageService from '../services/TimeInPage';
import WebVitalsService from '../services/WebVitalsService';
import COSTANTS from '../constants';

class MasterWorker {
  private self: any;
  private textDecoder: TextDecoder = new TextDecoder();
  private formatters = {
    [COSTANTS.events.click]: ClickService,
    [COSTANTS.events.performance]: PerformanceService,
    [COSTANTS.events.mouseExit]: MouseExitService,
    [COSTANTS.events.selection]: SelectionService,
    [COSTANTS.events.scroll]: ScrollService,
    [COSTANTS.events.timeInPage]: TimeInPageService,
    [COSTANTS.events.webVitals]: WebVitalsService,
  };

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
    if(this.formatters[type]) formatted = this.formatters[type].formatEvent(eventDecoded);
    if(formatted) postMessage(formatted, null);
  }
}

const masterWorker = new MasterWorker();
