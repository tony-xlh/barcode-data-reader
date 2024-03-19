export interface Barcode {
  bytes:Uint8Array;
  barcodeType:"QR"|undefined;
  details:BarcodeDetail;
}

export enum DataType {
  text = 0,
  image = 1,
  unknown = 2
}

export interface ReadingResult {
  text?:string;
  img?:HTMLImageElement;
  blob?:Blob;
}

export interface BarcodeDetail {
  mode:number;
  model?:number;
  errorCorrectionLevel?:number;
  columns?:number;
  rows?:number;
  page?:number;
  totalPage?:number;
  parityData?:number;
  version?:number;
}