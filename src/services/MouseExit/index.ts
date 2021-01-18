import COSTANTS from "../../constants";

class MouseExit {
  static formatEvent = (event) => {
    const now = Date.now();
    const formatEvent = {
      type: COSTANTS.events.mouseExit,
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
          fromElement: event.fromElement,
        },
      },
    };
    return formatEvent;
  }
}

export default MouseExit;

