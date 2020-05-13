import { JSDOM } from 'jsdom';
import { getDomNode, calculateDomStructure, formatNode, formatMemoryInfo, formatEvent } from './formatter';

const { window } = new JSDOM(``, { runScripts: 'outside-only' });
window.eval(`document.body.innerHTML = '<div id="container"> <img id="soniceimage" class="hp hq s t u hr ai ib __web-inspector-hide-shortcut__" width="834" height="176" srcset="https://miro.medium.com/max/552/1*PWOoWRhG9lWjhU4z6qFCOQ.png 276w, https://miro.medium.com/max/1104/1*PWOoWRhG9lWjhU4z6qFCOQ.png 552w, https://miro.medium.com/max/1280/1*PWOoWRhG9lWjhU4z6qFCOQ.png 640w, https://miro.medium.com/max/1400/1*PWOoWRhG9lWjhU4z6qFCOQ.png 700w" sizes="700px" role="presentation"></div>';`);

test('[getDomNode] Testing base', () => {
  const element = window.document.body.querySelector('img');
  expect(getDomNode(element)).toBe('img#soniceimage');
});


test('[calculateDomStructure] Testing base', () => {
  const element = window.document.body.querySelector('img');
  expect(calculateDomStructure(element)).toBe(' > html > body > div#container > img#soniceimage');
});


test('[formatNode] Testing base', () => {
  const element = window.document.body.querySelector('img');
  expect(formatNode(element)).toEqual({ className: 'hp hq s t u hr ai ib __web-inspector-hide-shortcut__', domStructure: ' > html > body > div#container > img#soniceimage', domType: 'HTMLImageElement', id: 'soniceimage', identifier: 'img#soniceimage', name: '', position: { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0 }, type: 'IMG' });
});

test('[formatMemoryInfo] Testing base', () => {
  const fakeEvent = { totalJSHeapSize: 10, usedJSHeapSize: 100, jsHeapSizeLimit: 1000 };
  const otherEvent = { asada: 10, usedJSHedadaapSize: 100, jsHeapSdasdadaizeLimit: 1000 };
  expect(formatMemoryInfo({ ...fakeEvent, otherEvent })).toEqual(fakeEvent);
});


test('[formatEvent] Testing base', () => {
  const event = formatEvent(window.performance);
  expect(event).toEqual({ path: null, timeOrigin: event.timeOrigin });
});
