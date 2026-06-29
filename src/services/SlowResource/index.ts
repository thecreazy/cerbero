import COSTANTS from '../../constants';

export const SLOW_THRESHOLD_MS = 1000;

interface SlowResourceInput {
  name: string;
  duration: number;
  initiatorType: string;
  startTime: number;
  startDate: number;
}

class SlowResource {
  static formatEvent = (data: SlowResourceInput) => ({
    type: COSTANTS.events.slowResource,
    time: Date.now(),
    after: Date.now() - data.startDate,
    data: {
      name: data.name,
      duration: data.duration,
      initiatorType: data.initiatorType,
      startTime: data.startTime,
    },
  })
}

export default SlowResource;
