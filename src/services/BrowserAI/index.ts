import COSTANTS from '../../constants';

interface BrowserAIInput {
  hasChromeAI: boolean;
  chromeAIModel: string | null;
  hasWebNN: boolean;
  startDate?: number;
}

class BrowserAI {
  static formatEvent = (data: BrowserAIInput) => ({
    type: COSTANTS.events.browserAI,
    time: Date.now(),
    data: {
      hasChromeAI: data.hasChromeAI,
      chromeAIModel: data.chromeAIModel,
      hasWebNN: data.hasWebNN,
    },
  })
}

export default BrowserAI;
