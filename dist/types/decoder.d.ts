import * as AV from 'aurora-js-ts';
export declare class MP3Decoder extends AV.Decoder {
    setCookie(cookie: any): void;
    private mp3_stream;
    private frame;
    private synth;
    private seeking;
    init(): void;
    readChunk(): Float32Array;
    seek(timestamp: any): any;
}
