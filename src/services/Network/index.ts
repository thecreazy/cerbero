import COSTANTS from '../../constants';

interface NetworkInput {
  effectiveType?: string | null;
  downlink?: number | null;
  rtt?: number | null;
  saveData?: boolean;
  startDate?: number;
}

class Network {
  static formatEvent = (data: NetworkInput) => ({
    type: COSTANTS.events.network,
    time: Date.now(),
    data: {
      effectiveType: data.effectiveType ?? null,
      downlink: data.downlink ?? null,
      rtt: data.rtt ?? null,
      saveData: data.saveData ?? false,
    },
  })
}

export default Network;
