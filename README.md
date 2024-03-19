# barcode-data-reader

A JavaScript library to read the binary data of barcodes.

Currently, it is mainly designed to work with QR codes.

A QR code has several modes for encoding the data.

| Input mode   | Mode indicator | Max. characters | Possible characters, default encoding                      |   |
|--------------|----------------|-----------------|------------------------------------------------------------|---|
| Numeric only | 1              | 7,089           | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9                               |   |
| Alphanumeric | 2              | 4,296           | 0–9, A–Z (upper-case only), space, $, %, *, +, -, ., /, :  |   |
| Binary/byte  | 4              | 2,953           | ISO/IEC 8859-1                                             |   |
| Kanji/kana   | 8              | 1,817           | Shift JIS X 0208                                           |
| Structured Append   | 3              | unlimited           | Not specific              |

PS: structured append is a mode that the data is divided into several barcodes.

This library can read the data based on different modes. If the text encoding cannot be decided by the ECI mode, it uses [chardet](https://www.npmjs.com/package/chardet) to guess the encoding.

[Online demo](https://tony-xlh.github.io/barcode-data-reader/)

## Installation

Via NPM:

```
npm install barcode-data-reader
```

Via CDN:

```
<script type="module">
  import { BarcodeDataReader } from 'https://cdn.jsdelivr.net/npm/barcode-data-reader/dist/barcode-data-reader.js';
</script>
```

## Usage 

Sample code reading barcode results from Dynamsoft Barcode Reader.

```js
let result;// Dynamsoft's  Captured Result Item
let barcodes = [];
for (let index = 0; index < result.items.length; index++) {
  const item = result.items[index];
  if (item.type === Dynamsoft.Core.EnumCapturedResultItemType.CRIT_BARCODE) {
    let data = new Uint8Array(item.bytes.length);
    data.set(item.bytes);
    let barcode = {
      bytes:data,
      details:item.details
    }
    barcodes.push(barcode);
  }
}

let reader = new BarcodeDataReader(barcodes);
let dataType = 0; //0:text, 1:image, 2:unknown
let readingResults = await reader.read(barcodes,dataType);
```

## Interfaces

```ts
export interface ReadingResult {
  text?:string;
  img?:HTMLImageElement;
  blob?:Blob;
}

export enum DataType {
  text = 0,
  image = 1,
  unknown = 2
}

export interface Barcode {
  bytes:Uint8Array;
  barcodeType:"QR"|undefined;
  details:BarcodeDetail;
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
```