import COSTANTS from '../../constants';

const TOTAL: number = 100;

interface ScrollInput {
  height: number;
  scroll: number;
  startDate: number;
}

class Scroll {
  static formatEvent = (data: ScrollInput) => {
    const now = Date.now();
    return {
      type: COSTANTS.events.scroll,
      time: now,
      after: now - data.startDate,
      data: {
        scroll: {
          fromTop: data.scroll,
          domHeight: data.height,
          percentage: Math.ceil(TOTAL * data.scroll / data.height),
        },
      },
    };
  }
}

export default Scroll;
