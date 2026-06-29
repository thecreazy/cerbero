import COSTANTS from '../../constants';

interface MouseExitTarget {
  targetId?: string;
  targetTagName?: string;
  targetClass?: string;
  targetDomType?: string;
  targetIdentifier?: string;
  targetDomStructure?: string;
  targetPosition?: DOMRect | Record<string, unknown>;
}

interface MouseExitInput extends MouseExitTarget {
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
  startDate: number;
}

class MouseExit {
  static formatEvent = (event: MouseExitInput) => {
    const now = Date.now();
    const target: Record<string, unknown> = {
      id: event.targetId ?? '',
      type: event.targetTagName ?? '',
      className: event.targetClass ?? '',
      domType: event.targetDomType ?? '',
      identifier: event.targetIdentifier ?? '',
    };
    if (event.targetDomStructure !== undefined) target.domStructure = event.targetDomStructure;
    if (event.targetPosition !== undefined) target.position = event.targetPosition;
    return {
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
        elements: { target },
      },
    };
  }
}

export default MouseExit;
