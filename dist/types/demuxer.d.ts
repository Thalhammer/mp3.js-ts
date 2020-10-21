import * as AV from 'aurora-js-ts';
export declare class MP3Demuxer extends AV.Demuxer {
    init(): void;
    private dataSize;
    private metadata;
    private sentInfo;
    static probe(stream: AV.Stream): boolean;
    static getID3v2Header(stream: any): {
        version: string;
        major: number;
        minor: number;
        flags: number;
        length: number;
    };
    parseDuration(header: any, off: any): boolean;
    readChunk(): void;
}
