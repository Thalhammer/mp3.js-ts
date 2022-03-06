import { MP3FrameHeader } from './header';
import * as utils from './utils';
import { Layer1 } from './layer1';
import { Layer2 } from './layer2';
import { Layer3 } from './layer3';
import { MP3Stream } from './stream';

export class MP3Frame {
	// included layer decoders are registered here
	static layers = [
		null,
		Layer1,
		Layer2,
		Layer3
	];

	public header: MP3FrameHeader = null;                     // MPEG audio header
	private options = 0;                       // decoding options (from stream)
	public sbsample = utils.makeArray([2, 36, 32]); // synthesis subband filter samples
	private overlap = utils.makeArray([2, 32, 18]);  // Layer III block overlap data
	private decoders: (Layer1 | Layer2 | Layer3)[] = [];
	constructor() {
	}

	decode(stream: MP3Stream) {
		if (!this.header || !(this.header.flags & MP3FrameHeader.FLAGS.INCOMPLETE)) { this.header = MP3FrameHeader.decode(stream); }

		this.header.flags &= ~MP3FrameHeader.FLAGS.INCOMPLETE;

		// make an instance of the decoder for this layer if needed
		let decoder = this.decoders[this.header.layer - 1];
		if (!decoder) {
			const Layer = MP3Frame.layers[this.header.layer];
			if (!Layer) { throw new Error('Layer ' + this.header.layer + ' is not supported.'); }

			decoder = this.decoders[this.header.layer - 1] = new Layer();
		}

		decoder.decode(stream, this);
	}
}
