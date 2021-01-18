import COSTANTS from "../../constants";

class Click {
  static formatEvent = (event) => {
    const now = Date.now();
    const formatEvent = {
      type: COSTANTS.events.click,
      time: now,
      after: now - event.startDate,
      data: {
        position: {
          screenX: event.screenX,
          screenY: event.screenY,
          clientX: event.clientX,
          clientY: event.clientY,
          pageX: event.pageX,
          pageY: event.pageY,
          x: event.x,
          y: event.y,
          offsetX: event.offsetX,
          offsetY: event.offsetY,
        },
        keys: {
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          metaKey: event.metaKey,
        },
        elements:{
          target: event.target,
        },
      },
    };
    return formatEvent;
  }
}

export default Click;
