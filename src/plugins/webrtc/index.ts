import { CerberoPlugin, PluginEmitter } from '../../index';

const IP_PATTERN = /(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4})/gi;

const isPrivateIp = (ip: string): boolean =>
  /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1|fe80:)/i.test(ip);

export const webrtcPlugin = (): CerberoPlugin => ({
  name: 'webrtcIp',
  init: (emit: PluginEmitter) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      const localIps = new Set<string>();
      const publicIps = new Set<string>();
      let emitted = false;

      const done = () => {
        if (emitted) return;
        emitted = true;
        emit('webrtcIp', {
          localIps: Array.from(localIps),
          publicIps: Array.from(publicIps),
        });
        pc.close();
      };

      pc.onicecandidate = (e) => {
        if (!e.candidate) {
          done();
          return;
        }
        const matches = e.candidate.candidate.match(IP_PATTERN) ?? [];
        matches.forEach(ip => {
          if (isPrivateIp(ip)) localIps.add(ip);
          else publicIps.add(ip);
        });
      };

      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));

      // Fallback: some browsers never fire null candidate
      setTimeout(done, 3000);
    } catch {
      // RTCPeerConnection not available or blocked (Firefox privacy.resistFingerprinting, Brave)
    }
  },
});
