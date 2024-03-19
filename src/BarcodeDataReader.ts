import {Barcode, DataType, ReadingResult } from "./definitions";
import chardet from 'chardet';

export class BarcodeDataReader{
  async read(barcodes:Barcode[],dataType:DataType):Promise<ReadingResult[]>{
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
      results = await this.readStructuredAppendBarcodes(barcodes,dataType);
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

  private async readStructuredAppendBarcodes(barcodes:Barcode[],dataType:DataType):Promise<ReadingResult[]>{
    console.log(dataType);
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
    }else if (dataType == DataType.image) {
      const img = await this.getImageFromUint8Array(concatedData);
      let result:ReadingResult = {
        img:img
      }
      results.push(result);
    }else{
      let result:ReadingResult = {
        blob:this.getBlobFromUint8Array(concatedData)
      }
      results.push(result);
    }
    return results;
  }

  getBlobFromUint8Array(data:Uint8Array) {
    return new Blob([data]);
  }

  getImageFromUint8Array(data:Uint8Array):Promise<HTMLImageElement>{
    return new Promise<HTMLImageElement>((resolve, _reject) => {
      const img = document.createElement("img");  
      const blob = this.getBlobFromUint8Array(data);
      img.onload = function(){
        resolve(img);
      }
      img.src = URL.createObjectURL(blob);
    })
  }
}