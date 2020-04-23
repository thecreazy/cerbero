export interface NodeStructure {
  constructor: any;
  name: string;
  id: string;
  nodeName: string;
  className: string;
  identifier: string;
  getBoundingClientRect: Function;
  parentElement: NodeStructure;
}
