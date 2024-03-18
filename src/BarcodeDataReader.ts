import {Barcode, DataType, ReadingResult } from "./definitions";
import chardet from 'chardet';

export class BarcodeDataReader{
  read(barcodes:Barcode[],dataType:DataType):ReadingResult[]{
    if (barcodes.length == 0) {
      throw new Error("No barcodes given");
    }
    let results:ReadingResult[] = [];
    const mode = barcodes[0].details.mode;
    if (mode == 1) {
      results = this.readNumericBarcodes(barcodes);
    }else if (mode == 2) {
      results = this.readAlphaNumericBarcodes(barcodes);
    }else if (mode == 4) {
      results = this.readByteEncodingBarcodes(barcodes);
    }else if (mode == 8) {
      results = this.readKanjiBarcodes(barcodes);
    }else if (mode == 3) {
      results = this.readStructureAppendBarcodes(barcodes,dataType);
    }
    return results;
  }

  private readByteEncodingBarcodes(_barcodes:Barcode[]):ReadingResult[]{
    return [];
  }


  private readAlphaNumericBarcodes(_barcodes:Barcode[]):ReadingResult[]{
    return [];
  }

  private readNumericBarcodes(_barcodes:Barcode[]):ReadingResult[]{
    return [];
  }

  private readKanjiBarcodes(_barcodes:Barcode[]):ReadingResult[]{
    return [];
  }

  private readStructureAppendBarcodes(barcodes:Barcode[],dataType:DataType):ReadingResult[]{
    let results:ReadingResult[] = [];
    barcodes.sort((a, b) => (a.details.page ?? 0) - (b.details.page ?? 0))
    let concatedData:Uint8Array = new Uint8Array();
    for (let index = 0; index < barcodes.length; index++) {
      const barcode = barcodes[index];
      let merged = new Uint8Array(barcode.bytes.length + concatedData.length);
      merged.set(concatedData);
      merged.set(barcode.bytes, concatedData.length);
      concatedData = merged;
    }
    if (dataType == DataType.text) {
      const charset = chardet.analyse(concatedData);
      const decoder = new TextDecoder(charset[0].name);
      const text = decoder.decode(concatedData);
      let result:ReadingResult = {
        text:text
      }
      results.push(result);
    }
    return results;
  }
}