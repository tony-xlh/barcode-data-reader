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
      results = await this.readByteEncodingBarcodes(barcodes,dataType);
    }else if (mode == 8) {
      results = this.readKanjiBarcodes(barcodes);
    }else if (mode == 3) {
      results = await this.readStructuredAppendBarcodes(barcodes,dataType);
    }
    return results;
  }

  
  private async readByteEncodingBarcodes(barcodes:Barcode[],dataType:DataType):Promise<ReadingResult[]>{
    let results:ReadingResult[] = [];
    for (let index = 0; index < barcodes.length; index++) {
      const barcode = barcodes[index];
      let result:ReadingResult = await this.getResultBasedOnDataType(barcode.bytes,dataType);
      results.push(result);
    }
    return results;
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
    let result = await this.getResultBasedOnDataType(concatedData,dataType);
    results.push(result);
    return results;
  }

  async getResultBasedOnDataType(data:Uint8Array,dataType:DataType) {
    let result:ReadingResult;
    if (dataType == DataType.text) {
      const charset = chardet.analyse(data);
      const decoder = new TextDecoder(charset[0].name);
      const text = decoder.decode(data);
      result = {
        text:text
      }
    }else if (dataType == DataType.image) {
      const img = await this.getImageFromUint8Array(data);
      result = {
        img:img
      }
    }else{
      result = {
        blob:this.getBlobFromUint8Array(data)
      }
    }
    return result;
  }

  getBlobFromUint8Array(data:Uint8Array) {
    return new Blob([data]);
  }

  getImageFromUint8Array(data:Uint8Array):Promise<HTMLImageElement>{
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement("img");  
      const blob = this.getBlobFromUint8Array(data);
      img.onload = function(){
        resolve(img);
      }
      img.onerror = function(error) {
        console.error(error);
        reject(error);
      }
      img.src = URL.createObjectURL(blob);
      console.log(img.src)
    })
  }
}