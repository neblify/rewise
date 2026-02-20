import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Polyfills for pdf-parse / pdfjs-dist in Node environment
if (typeof Promise.withResolvers === 'undefined') {
  if (typeof window === 'undefined') {
    // @ts-expect-error - polyfill for pdf-parse
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
if (!global.DOMMatrix) {
  // @ts-expect-error - polyfill for pdf-parse
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      // @ts-expect-error - polyfill for pdf-parse
      this.a = 1;
      // @ts-expect-error - polyfill for pdf-parse
      this.b = 0;
      // @ts-expect-error - polyfill for pdf-parse
      this.c = 0;
      // @ts-expect-error - polyfill for pdf-parse
      this.d = 1;
      // @ts-expect-error - polyfill for pdf-parse
      this.e = 0;
      // @ts-expect-error - polyfill for pdf-parse
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
    transformPoint(p: { x: number; y: number }) {
      return p;
    }
  };
}
if (!global.ImageData) {
  // @ts-expect-error - polyfill for pdf-parse
  global.ImageData = class ImageData {
    constructor(width: number, height: number) {
      // @ts-expect-error - polyfill for pdf-parse
      this.width = width;
      // @ts-expect-error - polyfill for pdf-parse
      this.height = height;
      // @ts-expect-error - polyfill for pdf-parse
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  };
}
if (!global.Path2D) {
  // @ts-expect-error - polyfill for pdf-parse
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
