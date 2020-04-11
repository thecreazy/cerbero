export interface CerberoEventStructure {
  type: string;
  event: Buffer;
}


export interface CerberoMessageStructure {
  data: CerberoEventStructure;
}

