import COSTANTS from '../../constants';

interface ClickInput {
  screenX?: number;
  screenY?: number;
  clientX?: number;
  clientY?: number;
  pageX?: number;
  pageY?: number;
  x?: number;
  y?: number;
  offsetX?: number;
  offsetY?: number;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  pointerType?: string;
  target?: Record<string, unknown>;
  startDate: number;
}

class Click {
  static formatEvent = (event: ClickInput) => {
    const now = Date.now();
    return {
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
        pointerType: event.pointerType ?? null,
        elements: {
          target: event.target,
        },
      },
    };
  }
}

export default Click;
