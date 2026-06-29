import { webrtcPlugin } from './index';

const makeMockPC = (candidates: string[]) => {
  let handler: ((e: RTCPeerConnectionIceEvent) => void) | null = null;
  return {
    createDataChannel: jest.fn(),
    createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: '' } as RTCSessionDescriptionInit),
    setLocalDescription: jest.fn().mockImplementation(() => {
      setTimeout(() => {
        candidates.forEach(c => handler?.({ candidate: { candidate: c } } as RTCPeerConnectionIceEvent));
        handler?.({ candidate: null } as unknown as RTCPeerConnectionIceEvent);
      }, 10);
      return Promise.resolve();
    }),
    close: jest.fn(),
    get onicecandidate() { return handler; },
    set onicecandidate(fn: ((e: RTCPeerConnectionIceEvent) => void) | null) { handler = fn; },
  };
};

afterEach(() => jest.useRealTimers());

test('[webrtcPlugin] emits webrtcIp with local and public IPs', async () => {
  const mockPc = makeMockPC([
    'candidate:1 1 UDP 2122060799 192.168.1.100 12345 typ host',
    'candidate:2 1 UDP 1686052607 93.184.216.34 54321 typ srflx',
  ]);
  (global as unknown as { RTCPeerConnection: unknown }).RTCPeerConnection = jest.fn(() => mockPc);

  const emit = jest.fn();
  webrtcPlugin().init(emit);
  await new Promise(r => setTimeout(r, 100));

  expect(emit).toHaveBeenCalledWith('webrtcIp', {
    localIps: expect.arrayContaining(['192.168.1.100']),
    publicIps: expect.arrayContaining(['93.184.216.34']),
  });
});

test('[webrtcPlugin] candidate with no IP address is ignored (match returns null)', async () => {
  const mockPc = makeMockPC([
    'candidate:1 1 TCP 1518214911 typ host tcptype passive',  // no IP in string
    'candidate:2 1 UDP 2122060799 10.0.0.1 12345 typ host',
  ]);
  (global as unknown as { RTCPeerConnection: unknown }).RTCPeerConnection = jest.fn(() => mockPc);

  const emit = jest.fn();
  webrtcPlugin().init(emit);
  await new Promise(r => setTimeout(r, 100));

  const data = emit.mock.calls[0][1];
  expect(data.localIps).toContain('10.0.0.1');
});

test('[webrtcPlugin] emits exactly once when done() called twice (timeout + null candidate)', async () => {
  jest.useFakeTimers();
  let handler: ((e: RTCPeerConnectionIceEvent) => void) | null = null;
  const close = jest.fn();
  const mockPc = {
    createDataChannel: jest.fn(),
    createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: '' }),
    setLocalDescription: jest.fn().mockResolvedValue(undefined),
    close,
    get onicecandidate() { return handler; },
    set onicecandidate(fn: ((e: RTCPeerConnectionIceEvent) => void) | null) { handler = fn; },
  };
  (global as unknown as { RTCPeerConnection: unknown }).RTCPeerConnection = jest.fn(() => mockPc);

  const emit = jest.fn();
  webrtcPlugin().init(emit);
  await Promise.resolve(); // flush setLocalDescription

  // Trigger null candidate (fires done() once)
  handler?.({ candidate: null } as unknown as RTCPeerConnectionIceEvent);
  // Trigger the 3s timeout (fires done() again — should be ignored)
  jest.advanceTimersByTime(3000);

  expect(emit).toHaveBeenCalledTimes(1);
});

test('[webrtcPlugin] handles RTCPeerConnection constructor throwing gracefully', () => {
  (global as unknown as { RTCPeerConnection: unknown }).RTCPeerConnection =
    jest.fn(() => { throw new Error('RTCPeerConnection blocked'); });
  const emit = jest.fn();
  expect(() => webrtcPlugin().init(emit)).not.toThrow();
  expect(emit).not.toHaveBeenCalled();
});

test('[webrtcPlugin] handles RTCPeerConnection unavailable', () => {
  (global as unknown as { RTCPeerConnection: unknown }).RTCPeerConnection = undefined;
  const emit = jest.fn();
  expect(() => webrtcPlugin().init(emit)).not.toThrow();
});
