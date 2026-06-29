import { JSDOM } from 'jsdom';
import { getDomNode, calculateDomStructure, formatNode, formatMemoryInfo, formatEvent } from './formatter';
import { NodeStructure } from '../index.d';

const { window: jsDomWindow } = new JSDOM(``, { runScripts: 'outside-only' });
jsDomWindow.eval(`document.body.innerHTML = '<div id="container"> <img id="soniceimage" class="hp hq s t u hr ai ib __web-inspector-hide-shortcut__" width="834" height="176" srcset="https://miro.medium.com/max/552/1*PWOoWRhG9lWjhU4z6qFCOQ.png 276w, https://miro.medium.com/max/1104/1*PWOoWRhG9lWjhU4z6qFCOQ.png 552w, https://miro.medium.com/max/1280/1*PWOoWRhG9lWjhU4z6qFCOQ.png 640w, https://miro.medium.com/max/1400/1*PWOoWRhG9lWjhU4z6qFCOQ.png 700w" sizes="700px" role="presentation"></div>';`);

test('[getDomNode] Testing base', () => {
  const element = jsDomWindow.document.body.querySelector('img') as unknown as NodeStructure;
  expect(getDomNode(element)).toBe('img#soniceimage');
});

test('[calculateDomStructure] Testing base', () => {
  const element = jsDomWindow.document.body.querySelector('img') as unknown as NodeStructure;
  expect(calculateDomStructure(element)).toBe(' > html > body > div#container > img#soniceimage');
});

test('[calculateDomStructure] uses WeakMap cache on repeated calls', () => {
  const element = jsDomWindow.document.body.querySelector('img') as unknown as NodeStructure;
  const r1 = calculateDomStructure(element);
  const r2 = calculateDomStructure(element);
  expect(r1).toBe(r2);
  expect(r1).toBe(' > html > body > div#container > img#soniceimage');
});

test('[formatNode] Testing base with domPath and domPosition enabled', () => {
  const element = jsDomWindow.document.body.querySelector('img') as unknown as NodeStructure;
  expect(formatNode(element, { domPath: true, domPosition: true })).toEqual({
    className: 'hp hq s t u hr ai ib __web-inspector-hide-shortcut__',
    domStructure: ' > html > body > div#container > img#soniceimage',
    domType: 'HTMLImageElement',
    id: 'soniceimage',
    identifier: 'img#soniceimage',
    name: '',
    position: { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0 },
    type: 'IMG',
  });
});

test('[formatNode] Testing base without options omits domStructure and position', () => {
  const element = jsDomWindow.document.body.querySelector('img') as unknown as NodeStructure;
  const result = formatNode(element);
  expect(result.domStructure).toBeUndefined();
  expect(result.position).toBeUndefined();
  expect(result.id).toBe('soniceimage');
  expect(result.domType).toBe('HTMLImageElement');
});

test('[formatMemoryInfo] Testing base', () => {
  const fakeEvent = { totalJSHeapSize: 10, usedJSHeapSize: 100, jsHeapSizeLimit: 1000 };
  const otherEvent = { asada: 10, usedJSHedadaapSize: 100, jsHeapSdasdadaizeLimit: 1000 };
  expect(formatMemoryInfo({ ...fakeEvent, otherEvent })).toEqual(fakeEvent);
});

test('[formatNode] Testing text node with data/wholeText/nodeValue/textContent', () => {
  const textNode = jsDomWindow.document.createTextNode('hello world') as unknown as NodeStructure;
  const result = formatNode(textNode);
  expect(result.data).toBe('hello world');
  expect(result.wholeText).toBe('hello world');
  expect(result.nodeValue).toBe('hello world');
  expect(result.textContent).toBe('hello world');
});

test('[formatEvent] Testing base', () => {
  const event = formatEvent(jsDomWindow.performance);
  expect(event).toEqual({ path: null, timeOrigin: event.timeOrigin });
});

test('[formatEvent] Testing with DOM node in event', () => {
  const img = jsDomWindow.document.body.querySelector('img');
  const fakeEvent = { target: img, type: 'click' };
  const result = formatEvent(fakeEvent);
  expect(result.target).toBeDefined();
  expect(result.path).toBeNull();
});

test('[formatEvent] with domPath option passes through to formatNode', () => {
  // Must use global document so instanceof Node passes (separate JSDOM instances have separate Node)
  const div = document.createElement('div');
  div.id = 'dom-path-test';
  document.body.appendChild(div);
  const result = formatEvent({ target: div }, { domPath: true });
  const target = result.target as { domStructure?: string; id?: string };
  expect(target.domStructure).toBeDefined();
  expect(target.id).toBe('dom-path-test');
  document.body.removeChild(div);
});

// These tests use the global jest-environment-jsdom window/document directly
// (not the local jsDomWindow) so that instanceof Node/Window checks in formatEvent work correctly
test('[formatEvent] with global DOM Node hits instanceof Node branch', () => {
  const div = document.createElement('div');
  div.id = 'global-test';
  const result = formatEvent({ target: div });
  expect(result.target).toBeDefined();
  expect(result.path).toBeNull();
});

test('[formatEvent] with MemoryInfo-named object hits MemoryInfo branch', () => {
  class MemoryInfo {
    totalJSHeapSize = 10;
    usedJSHeapSize = 100;
    jsHeapSizeLimit = 1000;
  }
  const result = formatEvent({ memory: new MemoryInfo() });
  expect(result.memory).toEqual({ totalJSHeapSize: 10, usedJSHeapSize: 100, jsHeapSizeLimit: 1000 });
});

test('[formatEvent] with Window-named constructor serializes to "Window"', () => {
  class Window {}
  const result = formatEvent({ view: new Window() });
  expect(result.view).toBe('Window');
});

test('[formatEvent] with falsy property values (null, 0, false) passes them through', () => {
  const result = formatEvent({ a: null, b: 0, c: false });
  expect(result.a).toBeNull();
  expect(result.b).toBe(0);
  expect(result.c).toBe(false);
});

test('[formatEvent] with null-prototype object covers constructor?.name optional-chain branch', () => {
  // Object.create(null) has no prototype → .constructor is undefined → ?. short-circuits
  const noProto = Object.create(null) as Record<string, unknown>;
  noProto.tag = 'custom';
  const result = formatEvent({ widget: noProto });
  // noProto is truthy, not a Node, not Window — passes through the final else branch
  expect(result.widget).toBe(noProto);
});

test('[formatEvent] uses window.InputDeviceCapabilities when available and excludes instances', () => {
  class InputDeviceCapabilities {}
  (window as unknown as Record<string, unknown>).InputDeviceCapabilities = InputDeviceCapabilities;
  const instance = new InputDeviceCapabilities();
  const result = formatEvent({ idc: instance, other: 'hello' });
  // InputDeviceCapabilities instances are excluded
  expect(result.idc).toBeUndefined();
  expect(result.other).toBe('hello');
  delete (window as unknown as Record<string, unknown>).InputDeviceCapabilities;
});

test('[formatNode] with empty constructor name falls back to empty string', () => {
  const anonConstructor = function() {};
  Object.defineProperty(anonConstructor, 'name', { value: '' });
  const fakeNode = {
    id: 'x',
    name: '',
    nodeName: 'DIV',
    className: '',
    constructor: anonConstructor,
    getBoundingClientRect: null,
    parentElement: null,
  } as unknown as NodeStructure;
  const result = formatNode(fakeNode, { domPosition: true });
  expect(result.domType).toBe('');
  expect(result.position).toEqual({});
});
