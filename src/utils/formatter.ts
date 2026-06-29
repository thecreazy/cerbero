
import { NodeStructure, FormattedNodeStructure } from '../index.d';

interface MemoryInfoLike {
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
  [key: string]: unknown;
}

export const getDomNode = (element: NodeStructure) => {
  const { id,nodeName } = element;
  return `${nodeName.toLowerCase()}${id? `#${id}`: ''}`;
};

export const calculateDomStructure = (element: NodeStructure) => {
  let prevElment: string = '';
  if(element.parentElement) prevElment = calculateDomStructure(element.parentElement);
  return `${prevElment} > ${getDomNode(element)}`;
};


export const formatNode = (element: NodeStructure) => {
  const { id, name, nodeName, constructor, className, getBoundingClientRect } = element;
  const formatted: FormattedNodeStructure = {
    id,
    name,
    className,
    type: nodeName,
    domType: constructor.name || '',
    identifier: getDomNode(element),
    domStructure: calculateDomStructure(element),
    position: getBoundingClientRect ? element.getBoundingClientRect() : {},
  };
  if(element.data) formatted.data = element.data;
  if(element.wholeText) formatted.wholeText = element.wholeText;
  if(element.nodeValue) formatted.nodeValue = element.nodeValue;
  if(element.textContent) formatted.textContent = element.textContent;
  return formatted;
};

export const formatMemoryInfo = (element: MemoryInfoLike) => {
  const { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit } = element;
  return { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit };
};


export const formatEvent = (e: object): Record<string, unknown> => {
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
      obj[key] = formatNode(value as unknown as NodeStructure);
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
