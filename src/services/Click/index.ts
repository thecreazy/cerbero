import COSTANTS from '../../constants';

interface ClickTarget {
  targetId?: string;
  targetTagName?: string;
  targetClass?: string;
  targetDomType?: string;
  targetIdentifier?: string;
  targetDomStructure?: string;
  targetPosition?: DOMRect | Record<string, unknown>;
}

interface ClickInput extends ClickTarget {
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
  pointerType?: string | null;
  startDate: number;
}

class Click {
  static formatEvent = (event: ClickInput) => {
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
        elements: { target },
      },
    };
  }
}

export default Click;
