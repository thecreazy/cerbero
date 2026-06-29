/* istanbul ignore file */

import { CerberoEventStructure, CerberoMessageStructure, FormattedMessageStructure } from './index.d';
import ClickService from '../services/Click';
import PerformanceService from '../services/Performance';
import MouseExitService from '../services/MouseExit';
import SelectionService from '../services/Selection';
import ScrollService from '../services/Scroll';
import TimeInPageService from '../services/TimeInPage';
import WebVitalsService from '../services/WebVitalsService';
import EnvironmentService from '../services/Environment';
import NetworkService from '../services/Network';
import LongTaskService from '../services/LongTask';
import PrivacySignalsService from '../services/PrivacySignals';
import BrowserAIService from '../services/BrowserAI';
import SlowResourceService from '../services/SlowResource';
import OrientationChangeService from '../services/OrientationChange';
import COSTANTS from '../constants';

class MasterWorker {
  private self: EventTarget;
  private textDecoder: TextDecoder = new TextDecoder();
  private formatters = {
    [COSTANTS.events.click]: ClickService,
    [COSTANTS.events.performance]: PerformanceService,
    [COSTANTS.events.mouseExit]: MouseExitService,
    [COSTANTS.events.selection]: SelectionService,
    [COSTANTS.events.scroll]: ScrollService,
    [COSTANTS.events.timeInPage]: TimeInPageService,
    [COSTANTS.events.webVitals]: WebVitalsService,
    [COSTANTS.events.environment]: EnvironmentService,
    [COSTANTS.events.network]: NetworkService,
    [COSTANTS.events.longTask]: LongTaskService,
    [COSTANTS.events.privacySignals]: PrivacySignalsService,
    [COSTANTS.events.browserAI]: BrowserAIService,
    [COSTANTS.events.slowResource]: SlowResourceService,
    [COSTANTS.events.orientationChange]: OrientationChangeService,
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

new MasterWorker();
