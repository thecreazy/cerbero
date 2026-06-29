/* istanbul ignore file */
export interface NodeStructure {
  constructor: any;
  name: string;
  id: string;
  nodeName: string;
  className: string;
  identifier: string;
  getBoundingClientRect: (() => DOMRect | Record<string, unknown>) | null;
  parentElement: NodeStructure;
  data: string;
  wholeText: string;
  nodeValue: string;
  textContent: string;
}

export interface FormattedNodeStructure {
  domType: string;
  name: string;
  id: string;
  type: string;
  className: string;
  identifier: string;
  data?: string;
  wholeText?: string;
  nodeValue?: string;
  textContent?: string;
  domStructure: string;
  position: object;
}
