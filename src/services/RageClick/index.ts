import COSTANTS from '../../constants';

interface RageClickInput {
  count: number;
  target: Record<string, unknown>;
  startDate?: number;
}

class RageClick {
  static formatEvent = (data: RageClickInput) => ({
    type: COSTANTS.events.rageClick,
    time: Date.now(),
    after: Date.now() - (data.startDate ?? 0),
    data: {
      count: data.count,
      target: data.target,
    },
  })
}

export default RageClick;
