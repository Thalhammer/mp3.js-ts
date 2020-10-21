export declare class MP3SideInfo {
    main_data_begin: any;
    private_bits: any;
    gr: MP3Granule[];
    scfsi: Uint8Array;
    constructor();
}
export declare class MP3Granule {
    ch: MP3Channel[];
    constructor();
}
export declare class MP3Channel {
    part2_3_length: any;
    big_values: any;
    global_gain: any;
    scalefac_compress: any;
    flags: any;
    block_type: any;
    table_select: Uint8Array;
    subblock_gain: Uint8Array;
    region0_count: any;
    region1_count: any;
    private scalefac;
    constructor();
}
export declare class Layer3 {
    private imdct;
    private si;
    private xr;
    private _exponents;
    private reqcache;
    private modes;
    private output;
    private tmp;
    private tmp2;
    constructor();
    decode(stream: any, frame: any): void;
    memcpy(dst: any, dstOffset: any, pSrc: any, srcOffset: any, length: any): any;
    sideInfo(stream: any, nch: any, lsf: any): {
        si: MP3SideInfo;
        data_bitlen: number;
        priv_bitlen: number;
    };
    decodeMainData(stream: any, frame: any, si: any, nch: any): void;
    scalefactors(stream: any, channel: any, gr0ch: any, scfsi: any): number;
    scalefactors_lsf(stream: any, channel: any, gr1ch: any, mode_extension: any): number;
    huffmanDecode(stream: any, xr: any, channel: any, sfbwidth: any, part2_length: any): void;
    requantize(value: any, exp: any): number;
    exponents(channel: any, sfbwidth: any, exponents: any): void;
    stereo(xr: any, granules: any, gr: any, header: any, sfbwidth: any): void;
    aliasreduce(xr: any, lines: any): void;
    imdct_l(X: any, z: any, block_type: any): void;
    imdct_s(X: any, z: any): void;
    overlap(output: any, overlap: any, sample: any, sb: any): void;
    freqinver(sample: any, sb: any): void;
    overlap_z(overlap: any, sample: any, sb: any): void;
    reorder(xr: any, channel: any, sfbwidth: any): void;
}
