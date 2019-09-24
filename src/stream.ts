import * as AV from 'aurora-js-ts';
import {MP3FrameHeader} from './header';

export class MP3Stream {
    private stream: AV.Bitstream;                     // actual bitstream
    private sync;                        // stream sync found
    private freerate;                        // free bitrate (fixed)
    private this_frame;   // start of current frame
    private next_frame;   // start of next frame

    private main_data; // actual audio data
    private md_len;                               // length of main data


    constructor(stream: AV.Bitstream) {
        this.stream = stream;                     // actual bitstream
        this.sync = false;                        // stream sync found
        this.freerate = 0;                        // free bitrate (fixed)
        this.this_frame = stream.stream.offset;   // start of current frame
        this.next_frame = stream.stream.offset;   // start of next frame

        this.main_data = new Uint8Array(MP3FrameHeader.BUFFER_MDLEN); // actual audio data
        this.md_len = 0;                               // length of main data

        // copy methods from actual stream
        (this as any).copy = this.stream.copy.bind(this.stream);
        (this as any).offset = this.stream.offset.bind(this.stream);
        (this as any).available = this.stream.available.bind(this.stream);
        (this as any).advance = this.stream.advance.bind(this.stream);
        (this as any).rewind = this.stream.rewind.bind(this.stream);
        (this as any).seek = this.stream.seek.bind(this.stream);
        (this as any).align = this.stream.align.bind(this.stream);
        (this as any).read = this.stream.read.bind(this.stream);
        (this as any).peek = this.stream.peek.bind(this.stream);
        (this as any).readLSB = this.stream.readLSB.bind(this.stream);
        (this as any).peekLSB = this.stream.peekLSB.bind(this.stream);
    }

    getU8(offset) {
        var stream = this.stream.stream;
        return stream.peekUInt8(offset - stream.offset);
    };

    nextByte() {
        var stream = this.stream;
        return stream.bitPosition === 0 ? stream.stream.offset : stream.stream.offset + 1;
    };

    doSync() {
        var stream = this.stream.stream;
        this.stream.align();

        while (this.stream.available(16) && !(stream.peekUInt8(0) === 0xff && (stream.peekUInt8(1) & 0xe0) === 0xe0)) {
            this.stream.advance(8);
        }

        if (!this.stream.available(MP3FrameHeader.BUFFER_GUARD))
            return false;

        return true;
    };

    reset(byteOffset) {
        this.stream.seek(byteOffset * 8);
        this.next_frame = byteOffset;
        this.sync = true;
    };
}