import COSTANTS from "../../constants";

class TimeInPage {
  static formatEvent = (data) => {
    const { startTime, nowTime, } = data;
    const now = Date.now();
    const formatEvent = {
      type: COSTANTS.events.timeInPage,
      time: now,
      data: {
        timePassed: nowTime - startTime
      },
    };
    return formatEvent;
  }
}

export default TimeInPage;

