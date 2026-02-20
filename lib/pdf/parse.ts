import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Polyfills for pdf-parse / pdfjs-dist in Node environment
// @ts-ignore
if (typeof Promise.withResolvers === 'undefined') {
  // @ts-ignore
  if (typeof window === 'undefined') {
    // @ts-ignore
    global.Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
}

// Global mocks for DOM APIs required by pdfjs-dist legacy builds
// @ts-ignore
if (!global.DOMMatrix) {
  // @ts-ignore
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      // @ts-ignore
      this.a = 1;
      // @ts-ignore
      this.b = 0;
      // @ts-ignore
      this.c = 0;
      // @ts-ignore
      this.d = 1;
      // @ts-ignore
      this.e = 0;
      // @ts-ignore
      this.f = 0;
    }
    multiply() {
      return this;
    }
    translate() {
      return this;
    }
    scale() {
      return this;
    }
    transformPoint(p: any) {
      return p;
    }
  };
}
// @ts-ignore
if (!global.ImageData) {
  // @ts-ignore
  global.ImageData = class ImageData {
    constructor(width: number, height: number) {
      // @ts-ignore
      this.width = width;
      // @ts-ignore
      this.height = height;
      // @ts-ignore
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  };
}
// @ts-ignore
if (!global.Path2D) {
  // @ts-ignore
  global.Path2D = class Path2D {};
}

/**
 * Parse a PDF file and extract its text content.
 */
export async function parsePdfToText(file: File): Promise<string> {
  const pdf = require('pdf-parse');
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdf(buffer);
  return data.text as string;
}
