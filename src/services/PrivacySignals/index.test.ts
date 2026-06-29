import PrivacySignals from './index';
import event from './__test__/index';
import output from './__test__/output';

test('[PrivacySignals Service] Testing base', () => {
  const result = PrivacySignals.formatEvent(event);
  output.time = result.time;
  expect(result).toEqual(output);
});
