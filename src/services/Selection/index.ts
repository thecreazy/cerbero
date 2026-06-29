import COSTANTS from '../../constants';

interface SelectionNode {
  offset?: number;
  [key: string]: unknown;
}

interface SelectionInput {
  event: {
    anchorNode: SelectionNode;
    anchorOffset: number;
    focusNode: SelectionNode;
    focusOffset: number;
    baseNode: SelectionNode;
    baseOffset: number;
    extentNode: SelectionNode;
    extentOffset: number;
  };
  selection: string;
  startDate: number;
}

class Selection {
  static formatEvent = (data: SelectionInput) => {
    const now = Date.now();
    const { event } = data;
    const { anchorNode, anchorOffset } = event;
    const { focusNode, focusOffset } = event;
    const { baseNode, baseOffset } = event;
    const { extentNode, extentOffset } = event;
    anchorNode.offset = anchorOffset;
    focusNode.offset = focusOffset;
    baseNode.offset = baseOffset;
    extentNode.offset = extentOffset;
    return {
      type: COSTANTS.events.selection,
      time: now,
      after: now - data.startDate,
      data: {
        text: data.selection,
        elements: {
          anchorNode,
          focusNode,
          baseNode,
          extentNode,
        },
      },
    };
  }
}

export default Selection;
