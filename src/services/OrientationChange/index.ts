import COSTANTS from '../../constants';

interface OrientationChangeInput {
  orientationType: OrientationType;
  angle: number;
  startDate?: number;
}

class OrientationChange {
  static formatEvent = (data: OrientationChangeInput) => ({
    type: COSTANTS.events.orientationChange,
    time: Date.now(),
    data: {
      type: data.orientationType,
      angle: data.angle,
    },
  })
}

export default OrientationChange;
