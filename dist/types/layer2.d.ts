import { MP3Frame } from './frame';
import { MP3Stream } from './stream';
export declare class Layer2 {
    private samples;
    private allocation;
    private scfsi;
    private scalefactor;
    constructor();
    decode(stream: MP3Stream, frame: MP3Frame): void;
    decodeSamples(stream: any, quantclass: any): void;
}
