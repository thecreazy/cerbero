import COSTANTS from '../../constants/index';

class Performance {
  static formatEvent = (event) => {
    const formatEvent = {
      type: COSTANTS.events.performance,
      time: Date.now(),
      data: {
        timing: event.timing,
        navigation: event.navigation,
        memory: event.memory,
      },
    };
    return formatEvent;
  }
}

export default Performance;

