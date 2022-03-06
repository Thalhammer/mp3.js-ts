export declare class IMDCT {
    static readonly S: number[][];
    private tmp_imdct36;
    private tmp_dctIV;
    private tmp_sdctII;
    constructor();
    imdct36(x: any, y: any): void;
    dctIV(y: any, X: any): void;
    sdctII(x: any, X: any): void;
}
