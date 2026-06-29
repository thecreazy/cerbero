import COSTANTS from '../../constants/index';

class Performance {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static formatEvent = (event: any) => {
    return {
      type: COSTANTS.events.performance,
      time: Date.now(),
      data: {
        navigation: {
          type: event.type,
          redirectCount: event.redirectCount,
          duration: event.duration,
        },
        timing: {
          fetchStart: event.fetchStart,
          domainLookupStart: event.domainLookupStart,
          domainLookupEnd: event.domainLookupEnd,
          connectStart: event.connectStart,
          connectEnd: event.connectEnd,
          requestStart: event.requestStart,
          responseStart: event.responseStart,
          responseEnd: event.responseEnd,
          domInteractive: event.domInteractive,
          domContentLoadedEventStart: event.domContentLoadedEventStart,
          domContentLoadedEventEnd: event.domContentLoadedEventEnd,
          domComplete: event.domComplete,
          loadEventStart: event.loadEventStart,
          loadEventEnd: event.loadEventEnd,
        },
      },
    };
  }
}

export default Performance;
