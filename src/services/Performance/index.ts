class Click {
  static formatEvent = (event) => {
    const formatEvent = {
      type: 'performance',
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

export default Click;

