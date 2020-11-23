import * as AV from 'aurora-js-ts';
export declare class MP3Stream {
    stream: AV.Bitstream;
    sync: boolean;
    freerate: number;
    this_frame: number;
    next_frame: number;
    main_data: Uint8Array;
    md_len: number;
    constructor(stream: AV.Bitstream);
    getU8(offset: any): number;
    getU16(offset: any): number;
    getU24(offset: any): number;
    getU32(offset: any): number;
    nextByte(): number;
    doSync(): boolean;
    reset(byteOffset: any): void;
    copy(): AV.Bitstream;
    offset(): number;
    available(bits: number): boolean;
    advance(bits: number): void;
    rewind(bits: number): void;
    seek(offset: number): void;
    align(): void;
    read(bits: number, signed?: boolean): any;
    peek(bits: number, signed?: boolean): any;
    readLSB(bits: number, signed?: boolean): any;
    peekLSB(bits: number, signed?: boolean): any;
}
