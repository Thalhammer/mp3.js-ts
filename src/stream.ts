import * as AV from 'aurora-js-ts';
import { MP3FrameHeader } from './header';

export class MP3Stream {
	public stream: AV.Bitstream;                     // actual bitstream
	public sync: boolean;                        // stream sync found
	public freerate: number;                        // free bitrate (fixed)
	public this_frame: number;   // start of current frame
	public next_frame: number;   // start of next frame

	public main_data: Uint8Array; // actual audio data
	public md_len: number;                               // length of main data


	constructor(stream: AV.Bitstream) {
		this.stream = stream;                     // actual bitstream
		this.sync = false;                        // stream sync found
		this.freerate = 0;                        // free bitrate (fixed)
		this.this_frame = stream.stream.offset;   // start of current frame
		this.next_frame = stream.stream.offset;   // start of next frame

		this.main_data = new Uint8Array(MP3FrameHeader.BUFFER_MDLEN); // actual audio data
		this.md_len = 0;                               // length of main data

		// copy methods from actual stream
		// (this as any).copy = this.stream.copy.bind(this.stream);
		// (this as any).offset = this.stream.offset.bind(this.stream);
		// (this as any).available = this.stream.available.bind(this.stream);
		// (this as any).advance = this.stream.advance.bind(this.stream);
		// (this as any).rewind = this.stream.rewind.bind(this.stream);
		// (this as any).seek = this.stream.seek.bind(this.stream);
		// (this as any).align = this.stream.align.bind(this.stream);
		// (this as any).read = this.stream.read.bind(this.stream);
		// (this as any).peek = this.stream.peek.bind(this.stream);
		// (this as any).readLSB = this.stream.readLSB.bind(this.stream);
		// (this as any).peekLSB = this.stream.peekLSB.bind(this.stream);
	}

	getU8(offset) {
		const stream = this.stream.stream;
		return stream.peekUInt8(offset - stream.offset);
	}

	getU16(offset) {
		const stream = this.stream.stream;
		return stream.peekUInt16(offset - stream.offset);
	}

	getU24(offset) {
		const stream = this.stream.stream;
		return stream.peekUInt24(offset - stream.offset);
	}

	getU32(offset) {
		const stream = this.stream.stream;
		return stream.peekUInt32(offset - stream.offset);
	}

	nextByte() {
		const stream = this.stream;
		return stream.bitPosition === 0 ? stream.stream.offset : stream.stream.offset + 1;
	}

	doSync() {
		const stream = this.stream.stream;
		this.stream.align();

		while (this.stream.available(16) && !(stream.peekUInt8(0) === 0xff && (stream.peekUInt8(1) & 0xe0) === 0xe0)) {
			this.stream.advance(8);
		}

		if (!this.stream.available(MP3FrameHeader.BUFFER_GUARD)) {
			return false;
		}

		return true;
	}

	reset(byteOffset) {
		this.stream.seek(byteOffset * 8);
		this.next_frame = byteOffset;
		this.sync = true;
	}

	// copy methods from actual stream
	copy(): AV.Bitstream {
		return this.stream.copy();
	}

	offset(): number {
		return this.stream.offset();
	}

	available(bits: number): boolean {
		return this.stream.available(bits);
	}

	advance(bits: number) {
		return this.stream.advance(bits);
	}

	rewind(bits: number) {
		return this.stream.rewind(bits);
	}

	seek(offset: number) {
		return this.stream.seek(offset);
	}

	align() {
		return this.stream.align();
	}

	read(bits: number, signed?: boolean): any {
		return this.stream.read(bits, signed);
	}

	peek(bits: number, signed?: boolean): any {
		return this.stream.peek(bits, signed);
	}

	readLSB(bits: number, signed?: boolean): any {
		return this.stream.readLSB(bits, signed);
	}

	peekLSB(bits: number, signed?: boolean): any {
		return this.stream.peekLSB(bits, signed);
	}
}
