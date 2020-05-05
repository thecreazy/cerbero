const TOTAL = 100;

class Scroll {
  static formatEvent = (data) => {
    const { event, scroll, height, startDate } = data;
    const now = Date.now();
    const formatEvent = {
      type: 'scroll',
      time: now,
      after: now - startDate,
      data: {
        scroll: {
          fromTop: scroll,
          domHeight: height,
          percentage : Math.ceil(TOTAL * scroll / height),
        },
        elements: {
          srcElement: event.srcElement,
          target: event.target,
        },
      },
    };
    return formatEvent;
  }
}

export default Scroll;

