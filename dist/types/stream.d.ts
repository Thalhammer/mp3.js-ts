import * as AV from 'aurora-js-ts';
export declare class MP3Stream {
    private stream;
    private sync;
    private freerate;
    private this_frame;
    private next_frame;
    private main_data;
    private md_len;
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
