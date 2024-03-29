import * as AV from 'aurora-js-ts';
import { MP3FrameHeader } from './header';
import { MP3Stream } from './stream';
import { ID3v23Stream, ID3v22Stream, ID3Stream } from './id3';

const XING_OFFSETS = [[32, 17], [17, 9]];

export class MP3Demuxer extends AV.Demuxer {
	private dataSize: number;
	private metadata: any;
	private sentInfo: boolean;

	static probe(stream: AV.Stream) {
		const off = stream.offset;

		// skip id3 metadata if it exists
		const id3header = MP3Demuxer.getID3v2Header(stream);
		if (id3header) { stream.advance(10 + id3header.length); }

		// attempt to read the header of the first audio frame
		const s = new MP3Stream(new AV.Bitstream(stream));
		let header = null;

		try {
			header = MP3FrameHeader.decode(s);
		} catch (e) { }

		// go back to the beginning, for other probes
		stream.seek(off);

		return !!header;
	}

	static getID3v2Header(stream): {
		version: string;
		major: number;
		minor: number;
		flags: number;
		length: number;
	} {
		if (stream.peekString(0, 3) === 'ID3') {
			stream = AV.Stream.fromBuffer(stream.peekBuffer(0, 10));
			stream.advance(3); // 'ID3'

			const major = stream.readUInt8();
			const minor = stream.readUInt8();
			const flags = stream.readUInt8();
			const bytes = stream.readBuffer(4).data;
			const length = (bytes[0] << 21) | (bytes[1] << 14) | (bytes[2] << 7) | bytes[3];

			return {
				version: '2.' + major + '.' + minor,
				major: major,
				minor: minor,
				flags: flags,
				length: length
			};
		}

		return null;
	}

	init() {
	}

	parseDuration(header, off) {
		const stream = this.stream;
		let frames;

		if (this.metadata) {
			const mllt = this.metadata.MPEGLocationLookupTable;
			if (mllt) {
				const bitstream = new AV.Bitstream(AV.Stream.fromBuffer(mllt.data));
				const refSize = mllt.bitsForBytesDeviation + mllt.bitsForMillisecondsDev;
				let samples = 0;
				let bytes = 0;

				while (bitstream.available(refSize)) {
					this.addSeekPoint(bytes, samples);

					const bytesDev = bitstream.read(mllt.bitsForBytesDeviation);
					bitstream.advance(mllt.bitsForMillisecondsDev); // skip millisecond deviation

					bytes += mllt.bytesBetweenReference + bytesDev;
					samples += mllt.framesBetweenReference * header.nbsamples() * 32;
				}

				this.addSeekPoint(bytes, samples);
			}

			if (this.metadata.length) {
				this.emit('duration', parseInt(this.metadata.length, 10));
				return true;
			}
		}

		if (!header || header.layer !== 3) { return false; }

		// Check for Xing/Info tag
		stream.advance(XING_OFFSETS[header.flags & MP3FrameHeader.FLAGS.LSF_EXT ? 1 : 0][header.nchannels() === 1 ? 1 : 0]);
		let tag = stream.readString(4);
		if (tag === 'Xing' || tag === 'Info') {
			const flags = stream.readUInt32();
			if (flags & 1) { frames = stream.readUInt32(); }

			const size = (flags & 2) ? stream.readUInt32() : 0;

			if (flags & 4 && frames && size && this.seekPoints.length === 0) {
				for (let i = 0; i < 100; i++) {
					const b = stream.readUInt8();
					const pos = b / 256 * size | 0;
					const time = i / 100 * (frames * header.nbsamples() * 32) | 0;
					this.addSeekPoint(pos, time);
				}
			}

			if (flags & 8) { stream.advance(4); }

		} else {
			// Check for VBRI tag (always 32 bytes after end of mpegaudio header)
			stream.seek(off + 4 + 32);
			tag = stream.readString(4);
			if (tag === 'VBRI' && stream.readUInt16() === 1) { // Check tag version
				stream.advance(4); // skip delay and quality
				stream.advance(4); // skip size
				frames = stream.readUInt32();

				if (this.seekPoints.length === 0) {
					const entries = stream.readUInt16();
					const scale = stream.readUInt16();
					const bytesPerEntry = stream.readUInt16();
					const framesPerEntry = stream.readUInt16();
					const fn = 'readUInt' + (bytesPerEntry * 8);

					let pos = 0;
					for (let i = 0; i < entries; i++) {
						this.addSeekPoint(pos, i * framesPerEntry * header.nbsamples() * 32 | 0);
						pos += stream[fn]() * scale;
					}
				}
			}
		}

		if (!frames) { return false; }

		this.emit('duration', (frames * header.nbsamples() * 32) / header.samplerate * 1000 | 0);
		return true;
	}

	readChunk() {
		const stream = this.stream;

		if (!this.sentInfo) {
			// read id3 metadata if it exists
			const id3header = MP3Demuxer.getID3v2Header(stream);
			if (id3header && !this.metadata) {
				stream.advance(10);

				let id3: ID3Stream;
				if (id3header.major > 2) {
					id3 = new ID3v23Stream(id3header, stream);
				} else {
					id3 = new ID3v22Stream(id3header, stream);
				}

				this.metadata = id3.read();
				this.emit('metadata', this.metadata);
				stream.seek(10 + id3header.length);
			}

			// read the header of the first audio frame
			const off = stream.offset;
			const s = new MP3Stream(new AV.Bitstream(stream));

			const header = MP3FrameHeader.decode(s);
			if (!header) { return this.emit('error', 'Could not find first frame.'); }

			this.emit('format', {
				formatID: 'mp3',
				sampleRate: header.samplerate,
				channelsPerFrame: header.nchannels(),
				bitrate: header.bitrate,
				floatingPoint: true,
				layer: header.layer,
				flags: header.flags
			});

			const sentDuration = this.parseDuration(header, off);
			stream.advance(off - stream.offset);

			// if there were no Xing/VBRI tags, guesstimate the duration based on data size and bitrate
			this.dataSize = 0;
			if (!sentDuration) {
				this.on('end', () => {
					this.emit('duration', this.dataSize * 8 / header.bitrate * 1000 | 0);
				});
			}

			this.sentInfo = true;
		}

		while (stream.available(1)) {
			const buffer = stream.readSingleBuffer(stream.remainingBytes());
			this.dataSize += buffer.length;
			this.emit('data', buffer);
		}
	}
}

AV.Demuxer.register(MP3Demuxer);
