import { MP3FrameHeader } from './header';
import * as utils from './utils';
import { Layer1 } from './layer1';
import { Layer2 } from './layer2';
import { Layer3 } from './layer3';

export class MP3Frame {
    private header = null;                     // MPEG audio header
    private options = 0;                       // decoding options (from stream)
    private sbsample = utils.makeArray([2, 36, 32]); // synthesis subband filter samples
    private overlap = utils.makeArray([2, 32, 18]);  // Layer III block overlap data
    private decoders = [];
    constructor() {
    }

    // included layer decoders are registered here
    static layers = [
        null,
        Layer1,
        Layer2,
        Layer3
    ];

    decode(stream) {
        if (!this.header || !(this.header.flags & MP3FrameHeader.FLAGS.INCOMPLETE))
            this.header = MP3FrameHeader.decode(stream);

        this.header.flags &= ~MP3FrameHeader.FLAGS.INCOMPLETE;

        // make an instance of the decoder for this layer if needed
        var decoder = this.decoders[this.header.layer - 1];
        if (!decoder) {
            var Layer = MP3Frame.layers[this.header.layer];
            if (!Layer)
                throw new Error("Layer " + this.header.layer + " is not supported.");

            decoder = this.decoders[this.header.layer - 1] = new Layer();
        }

        decoder.decode(stream, this);
    };
}
