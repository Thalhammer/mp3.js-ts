import * as AV from 'aurora-js-ts';
import { MP3FrameHeader } from './header';
import { MP3Stream } from './stream';
import { MP3Frame } from './frame';
import { MP3Synth } from './synth';

export class MP3Decoder extends AV.Decoder {
	private mp3_stream: MP3Stream;
	private frame: MP3Frame;
	private synth: MP3Synth;
	private seeking: boolean;

	init() {
		this.mp3_stream = new MP3Stream(this.bitstream);
		this.frame = new MP3Frame();
		this.synth = new MP3Synth();
		this.seeking = false;
	}

	setCookie(cookie: any) { }

	readChunk() {
		const stream = this.mp3_stream;
		const frame = this.frame;
		const synth = this.synth;

		// if we just seeked, we may start getting errors involving the frame reservoir,
		// so keep going until we successfully decode a frame
		if (this.seeking) {
			while (true) {
				try {
					frame.decode(stream);
					break;
				} catch (err) {
					if (err === 'UnderflowError') { throw err; }
				}
			}

			this.seeking = false;
		} else {
			const sync = this.mp3_stream.sync;
			const next_frame = this.mp3_stream.next_frame;
			try {
				frame.decode(stream);
			} catch (err) {
				// Reset if we fail while decoding a frame
				this.mp3_stream.sync = sync;
				this.mp3_stream.next_frame = next_frame;
				throw err;
			}
		}

		synth.frame(frame);

		// interleave samples
		const data = synth.pcm.samples;
		const channels = synth.pcm.channels;
		const len = synth.pcm.length;
		const output = new Float32Array(len * channels);
		let j = 0;

		for (let k = 0; k < len; k++) {
			for (let i = 0; i < channels; i++) {
				output[j++] = data[i][k];
			}
		}

		return output;
	}

	seek(timestamp) {
		let offset: number;

		// if there was a Xing or VBRI tag with a seek table, use that
		// otherwise guesstimate based on CBR bitrate
		if (this.demuxer.seekPoints.length > 0) {
			timestamp = super.seek(timestamp);
			offset = this.stream.offset;
		} else {
			offset = timestamp * this.format.bitrate / 8 / this.format.sampleRate;
		}

		this.mp3_stream.reset(offset);

		let j = 0;
		let i = 0;
		// try to find 3 consecutive valid frame headers in a row
		for (i = 0; i < 4096; i++) {
			let pos = offset + i;

			for (j = 0; j < 3; j++) {
				this.mp3_stream.reset(pos);

				let header: MP3FrameHeader;
				try {
					header = MP3FrameHeader.decode(this.mp3_stream);
				} catch (e) {
					break;
				}

				// skip the rest of the frame
				const size = header.framesize();
				if (size == null) { break; }

				pos += size;
			}

			// check if we're done
			if (j === 3) { break; }
		}

		// if we didn't find 3 frames, just try the first one and hope for the best
		if (j !== 3) { i = 0; }

		this.mp3_stream.reset(offset + i);

		// if we guesstimated, update the timestamp to another estimate of where we actually seeked to
		if (this.demuxer.seekPoints.length === 0) { timestamp = this.stream.offset / (this.format.bitrate / 8) * this.format.sampleRate; }

		this.seeking = true;
		return timestamp;
	}
}

AV.Decoder.register('mp3', MP3Decoder);
