import COSTANTS from '../../constants';

class WebVitalsService {
  static formatEvent = (data) => {
    const { startDate, ...rest } = data;
    delete rest.path;
    const now = Date.now();
    const formatEvent = {
      type: COSTANTS.events.webVitals,
      time: now,
      after: now - startDate,
      data: { ...rest },
    };
    return formatEvent;
  }
}

export default WebVitalsService;

