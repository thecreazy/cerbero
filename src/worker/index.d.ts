export interface CerberoEventStructure {
  type: string;
  event: Buffer;
}


export interface CerberoMessageStructure {
  data: CerberoEventStructure;
}

export interface FormattedMessageStructure {
  type: string;
  data: unknown;
  time: number;
}

