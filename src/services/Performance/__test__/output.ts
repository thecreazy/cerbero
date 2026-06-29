export default {
  type: 'performance',
  time: 0,
  data: {
    navigation: {
      type: 'navigate',
      redirectCount: 0,
      duration: 1500,
    },
    timing: {
      fetchStart: 10,
      domainLookupStart: 11,
      domainLookupEnd: 12,
      connectStart: 12,
      connectEnd: 20,
      requestStart: 21,
      responseStart: 50,
      responseEnd: 80,
      domInteractive: 200,
      domContentLoadedEventStart: 205,
      domContentLoadedEventEnd: 210,
      domComplete: 1400,
      loadEventStart: 1410,
      loadEventEnd: 1500,
    },
  },
};
