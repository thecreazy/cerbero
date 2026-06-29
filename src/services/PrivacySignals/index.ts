import COSTANTS from '../../constants';

interface PrivacySignalsInput {
  gpc: boolean | null;
  doNotTrack: boolean;
  gpcAutoDisabled: boolean;
  startDate?: number;
}

class PrivacySignals {
  static formatEvent = (data: PrivacySignalsInput) => ({
    type: COSTANTS.events.privacySignals,
    time: Date.now(),
    data: {
      gpc: data.gpc,
      doNotTrack: data.doNotTrack,
      gpcAutoDisabled: data.gpcAutoDisabled,
    },
  })
}

export default PrivacySignals;
