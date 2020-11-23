import { MP3Stream } from './stream';
import { MP3Frame } from './frame';
export declare class Layer1 {
    private allocation;
    private scalefactor;
    constructor();
    decode(stream: MP3Stream, frame: MP3Frame): void;
    sample(stream: any, nb: any): number;
}
