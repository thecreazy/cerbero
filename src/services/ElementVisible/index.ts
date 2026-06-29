import COSTANTS from '../../constants';

interface ElementVisibleInput {
  selector: string;
  element: Record<string, unknown>;
  visibleRatio: number;
  startDate?: number;
}

class ElementVisible {
  static formatEvent = (data: ElementVisibleInput) => ({
    type: COSTANTS.events.elementVisible,
    time: Date.now(),
    after: Date.now() - (data.startDate ?? 0),
    data: {
      selector: data.selector,
      element: data.element,
      visibleRatio: data.visibleRatio,
    },
  })
}

export default ElementVisible;
