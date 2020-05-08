
import { NodeStructure, FormattedNodeStructure } from '../index.d';

export const getDomNode = (element: NodeStructure) => {
  const { id,nodeName } = element;
  return `${nodeName.toLowerCase()}${id? `#${id}`: ''}`;
};

export const _calculateDomStructure = (element: NodeStructure) => {
  let prevElment: string = '';
  if(element.parentElement) prevElment = _calculateDomStructure(element.parentElement);
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
    domStructure: _calculateDomStructure(element),
    position: getBoundingClientRect ? element.getBoundingClientRect() : {},
  };
  if(element.data) formatted.data = element.data;
  if(element.wholeText) formatted.wholeText = element.wholeText;
  if(element.nodeValue) formatted.nodeValue = element.nodeValue;
  if(element.textContent) formatted.textContent = element.textContent;
  return formatted;
};

const formatMemoryInfo = (element: any) => {
  const { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit } = element;
  return {
    totalJSHeapSize,
    usedJSHeapSize,
    jsHeapSizeLimit,
  };
};


export const formatEvent = (e: any) => {
  const obj: any = {};
  const { InputDeviceCapabilities } = window as any;
  for (const key in e) {
    if(e[key] && e[key].constructor.name === 'MemoryInfo') obj[key] = formatMemoryInfo(e[key]);
    else if (e[key] instanceof Node) obj[key] = formatNode(e[key]);
    else if (e[key] instanceof Window) obj[key] = 'Window';
    else if(e[key] instanceof InputDeviceCapabilities === false && typeof e[key] !== 'function') obj[key] = e[key];
  }
  obj['path'] = null;
  return { ...obj };
};
