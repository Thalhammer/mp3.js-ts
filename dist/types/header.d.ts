export declare class MP3FrameHeader {
    private layer;
    private mode;
    private mode_extension;
    private emphasis;
    private bitrate;
    private samplerate;
    private crc_check;
    private crc_target;
    private flags;
    private private_bits;
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
    decode(stream: any): void;
    static decode(stream: any): any;
    static free_bitrate(stream: any, header: any): void;
}
