import { MP3Stream } from './stream';
export declare class MP3FrameHeader {
    layer: number;
    mode: number;
    mode_extension: number;
    emphasis: number;
    bitrate: number;
    samplerate: number;
    crc_check: number;
    crc_target: number;
    flags: number;
    private_bits: number;
    constructor();
    static readonly BITRATES: number[][];
    static readonly SAMPLERATES: number[];
    static readonly FLAGS: {
        NPRIVATE_III: number;
        INCOMPLETE: number;
        PROTECTION: number;
        COPYRIGHT: number;
        ORIGINAL: number;
        PADDING: number;
        I_STEREO: number;
        MS_STEREO: number;
        FREEFORMAT: number;
        LSF_EXT: number;
        MC_EXT: number;
        MPEG_2_5_EXT: number;
    };
    static readonly PRIVATE: {
        HEADER: number;
        III: number;
    };
    static readonly MODE: {
        SINGLE_CHANNEL: number;
        DUAL_CHANNEL: number;
        JOINT_STEREO: number;
        STEREO: number;
    };
    static readonly EMPHASIS: {
        NONE: number;
        _50_15_US: number;
        CCITT_J_17: number;
        RESERVED: number;
    };
    static readonly BUFFER_GUARD: number;
    static readonly BUFFER_MDLEN: number;
    copy(): MP3FrameHeader;
    nchannels(): 1 | 2;
    nbsamples(): 12 | 18 | 36;
    framesize(): number;
    decode(stream: MP3Stream): void;
    static decode(stream: MP3Stream): MP3FrameHeader;
    static free_bitrate(stream: any, header: any): void;
}
