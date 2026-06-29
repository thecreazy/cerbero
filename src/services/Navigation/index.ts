import COSTANTS from '../../constants';

interface NavigationInput {
  from: string | null;
  to: string | null;
  navigationType: string;
  startDate?: number;
}

class Navigation {
  static formatEvent = (data: NavigationInput) => ({
    type: COSTANTS.events.navigation,
    time: Date.now(),
    after: Date.now() - (data.startDate ?? 0),
    data: {
      from: data.from,
      to: data.to,
      navigationType: data.navigationType,
    },
  })
}

export default Navigation;
