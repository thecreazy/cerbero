
import { NodeStructure, FormattedNodeStructure } from '../index.d';

export interface FormatterOptions {
  /** Include full DOM path via parent traversal (e.g. " > html > body > div > button"). Default: false. Expensive on deep DOMs. */
  domPath?: boolean;
  /** Include element bounding box via getBoundingClientRect(). Default: false. Forces a synchronous layout reflow. */
  domPosition?: boolean;
}

interface MemoryInfoLike {
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
  [key: string]: unknown;
}

// WeakMap cache so repeated clicks on the same element pay the traversal cost only once.
// Entries are automatically GC'd when the element is removed from the DOM.
const domPathCache = new WeakMap<Element, string>();

export const getDomNode = (element: NodeStructure) => {
  const { id, nodeName } = element;
  return `${nodeName.toLowerCase()}${id ? `#${id}` : ''}`;
};

export const calculateDomStructure = (element: NodeStructure): string => {
  const el = element as unknown as Element;
  if (domPathCache.has(el)) return domPathCache.get(el)!;
  let prevElement = '';
  if (element.parentElement) prevElement = calculateDomStructure(element.parentElement);
  const result = `${prevElement} > ${getDomNode(element)}`;
  domPathCache.set(el, result);
  return result;
};

export const formatNode = (element: NodeStructure, options: FormatterOptions = {}): FormattedNodeStructure => {
  const { id, name, nodeName, constructor, className, getBoundingClientRect } = element;
  const formatted: FormattedNodeStructure = {
    id,
    name,
    className,
    type: nodeName,
    domType: constructor.name || '',
    identifier: getDomNode(element),
    domStructure: options.domPath ? calculateDomStructure(element) : undefined,
    position: options.domPosition ? (getBoundingClientRect ? element.getBoundingClientRect() : {}) : undefined,
  };
  if (element.data) formatted.data = element.data;
  if (element.wholeText) formatted.wholeText = element.wholeText;
  if (element.nodeValue) formatted.nodeValue = element.nodeValue;
  if (element.textContent) formatted.textContent = element.textContent;
  return formatted;
};

export const formatMemoryInfo = (element: MemoryInfoLike) => {
  const { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit } = element;
  return { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit };
};

export const formatEvent = (e: object, options: FormatterOptions = {}): Record<string, unknown> => {
  const obj: Record<string, unknown> = {};
  // InputDeviceCapabilities is a Chrome-only API absent from TS DOM types — one justified any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const InputDeviceCapabilities = (window as any).InputDeviceCapabilities ?? Window;
  const record = e as Record<string, unknown>;
  for (const key in record) {
    const value = record[key];
    if (value && (value as { constructor?: { name?: string } }).constructor?.name === 'MemoryInfo') {
      obj[key] = formatMemoryInfo(value as MemoryInfoLike);
    } else if (value instanceof Node) {
      obj[key] = formatNode(value as unknown as NodeStructure, options);
    /* istanbul ignore next — window instanceof Window is untestable in jsdom */
    } else if (value instanceof Window) {
      obj[key] = 'Window';
    } else if (!(value instanceof InputDeviceCapabilities) && typeof value !== 'function') {
      obj[key] = value;
    }
  }
  obj['path'] = null;
  return obj;
};
