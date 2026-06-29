import COSTANTS from '../../constants';

interface LongTaskInput {
  duration: number;
  startTime: number;
  startDate: number;
}

class LongTask {
  static formatEvent = (data: LongTaskInput) => ({
    type: COSTANTS.events.longTask,
    time: Date.now(),
    after: Date.now() - data.startDate,
    data: {
      duration: data.duration,
      startTime: data.startTime,
    },
  })
}

export default LongTask;
