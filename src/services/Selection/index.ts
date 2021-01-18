import COSTANTS from '../../constants';

class Selection {
  static formatEvent = (data) => {
    const now = Date.now();
    const { event } : {event: any} = data;
    const { anchorNode, anchorOffset } = event;
    const { focusNode, focusOffset } = event;
    const { baseNode, baseOffset } = event;
    const { extentNode, extentOffset } = event;
    anchorNode.offset = anchorOffset;
    focusNode.offset = focusOffset;
    baseNode.offset = baseOffset;
    extentNode.offset = extentOffset;
    const formatEvent = {
      type: COSTANTS.events.selection,
      time: now,
      after: now - data.startDate,
      data: {
        text: data.selection,
        elements:{
          anchorNode,
          focusNode,
          baseNode,
          extentNode,
        },
      },
    };
    return formatEvent;
  }
}

export default Selection;

