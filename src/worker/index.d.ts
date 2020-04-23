export interface CerberoEventStructure {
  type: string;
  event: Buffer;
}


export interface CerberoMessageStructure {
  data: CerberoEventStructure;
}

export interface FormattedMessageStructure {
  type: string;
  data: any;
  time: number;
}

