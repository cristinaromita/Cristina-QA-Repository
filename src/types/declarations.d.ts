declare module 'pngjs' {
  export class PNG {
    constructor(options?: any);
    width: number;
    height: number;
    data: Buffer;
    static sync: any;
  }
  export namespace PNG { }
  export const sync: any;
}

declare module 'pixelmatch' {
  function pixelmatch(a: any, b: any, out: any, width: number, height: number, opts?: any): number;
  export = pixelmatch;
}
