import { Layer1 } from './layer1';
import { Layer2 } from './layer2';
import { Layer3 } from './layer3';
export declare class MP3Frame {
    private header;
    private options;
    private sbsample;
    private overlap;
    private decoders;
    constructor();
    static layers: (typeof Layer1 | typeof Layer2 | typeof Layer3)[];
    decode(stream: any): void;
}
