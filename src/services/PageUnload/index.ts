import COSTANTS from '../../constants';

interface PageUnloadInput {
  startDate: number;
  timeOnPage: number;
}

class PageUnload {
  static formatEvent = (data: PageUnloadInput) => ({
    type: COSTANTS.events.pageUnload,
    time: Date.now(),
    after: data.timeOnPage,
    data: {
      timeOnPage: data.timeOnPage,
    },
  })
}

export default PageUnload;
