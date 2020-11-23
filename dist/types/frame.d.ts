import { MP3FrameHeader } from './header';
import { Layer1 } from './layer1';
import { Layer2 } from './layer2';
import { Layer3 } from './layer3';
import { MP3Stream } from './stream';
export declare class MP3Frame {
    header: MP3FrameHeader;
    private options;
    sbsample: any;
    private overlap;
    private decoders;
    constructor();
    static layers: (typeof Layer1 | typeof Layer2 | typeof Layer3)[];
    decode(stream: MP3Stream): void;
}
