export declare class MP3Hufftable {
    table: any;
    linbits: any;
    startbits: any;
    constructor(table: any, linbits: any, startbits: any);
}
export declare const huff_quad_table: ({
    final: number;
    ptr: {
        bits: any;
        offset: any;
    };
} | {
    final: number;
    value: {
        v: any;
        w: any;
        x: any;
        y: any;
        hlen: any;
    };
})[][];
export declare const huff_pair_table: MP3Hufftable[];
