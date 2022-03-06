import * as AV from 'aurora-js-ts';
export declare abstract class ID3Stream extends AV.Base {
    protected header: {
        version: string;
        major: number;
        minor: number;
        flags: number;
        length: number;
    };
    protected stream: AV.Stream;
    protected offset: number;
    private data;
    constructor(header: any, stream: AV.Stream);
    read(): {
        [idx: string]: any[];
    };
    abstract readHeader(): any;
    protected abstract getFrameTypes(): any;
    protected abstract getNames(): any;
    protected abstract getMap(): any;
    readFrame(): {
        value: any;
        key: string;
    };
    decodeFrame(header: any, fields: any): any;
}
export declare class ID3v23Stream extends ID3Stream {
    private frameTypes;
    private map;
    private names;
    readHeader(): any;
    getMap(): {
        text: string[];
        url: string[];
    };
    getFrameTypes(): {
        text: {
            encoding: number;
            value: string;
        };
        url: {
            value: string;
        };
        TXXX: {
            encoding: number;
            description: string;
            value: string;
        };
        WXXX: {
            encoding: number;
            description: string;
            value: string;
        };
        USLT: {
            encoding: number;
            language: number;
            description: string;
            value: string;
        };
        COMM: {
            encoding: number;
            language: number;
            description: string;
            value: string;
        };
        APIC: {
            encoding: number;
            mime: string;
            type: string;
            description: string;
            data: string;
        };
        UFID: {
            owner: string;
            identifier: string;
        };
        MCDI: {
            value: string;
        };
        PRIV: {
            owner: string;
            value: string;
        };
        GEOB: {
            encoding: number;
            mime: string;
            filename: string;
            description: string;
            data: string;
        };
        PCNT: {
            value: string;
        };
        POPM: {
            email: string;
            rating: string;
            counter: string;
        };
        AENC: {
            owner: string;
            previewStart: string;
            previewLength: string;
            encryptionInfo: string;
        };
        ETCO: {
            format: string;
            data: string;
        };
        MLLT: {
            framesBetweenReference: string;
            bytesBetweenReference: string;
            millisecondsBetweenReference: string;
            bitsForBytesDeviation: string;
            bitsForMillisecondsDev: string;
            data: string;
        };
        SYTC: {
            format: string;
            tempoData: string;
        };
        SYLT: {
            encoding: number;
            language: number;
            format: string;
            contentType: string;
            description: string;
            data: string;
        };
        RVA2: {
            identification: string;
            data: string;
        };
        EQU2: {
            interpolationMethod: string;
            identification: string;
            data: string;
        };
        RVRB: {
            left: string;
            right: string;
            bouncesLeft: string;
            bouncesRight: string;
            feedbackLL: string;
            feedbackLR: string;
            feedbackRR: string;
            feedbackRL: string;
            premixLR: string;
            premixRL: string;
        };
        RBUF: {
            size: string;
            flag: string;
            offset: string;
        };
        LINK: {
            identifier: string;
            url: string;
            data: string;
        };
        POSS: {
            format: string;
            position: string;
        };
        USER: {
            encoding: number;
            language: number;
            value: string;
        };
        OWNE: {
            encoding: number;
            price: string;
            purchaseDate: string;
            seller: string;
        };
        COMR: {
            encoding: number;
            price: string;
            validUntil: string;
            contactURL: string;
            receivedAs: string;
            seller: string;
            description: string;
            logoMime: string;
            logo: string;
        };
        ENCR: {
            owner: string;
            methodSymbol: string;
            data: string;
        };
        GRID: {
            owner: string;
            groupSymbol: string;
            data: string;
        };
        SIGN: {
            groupSymbol: string;
            signature: string;
        };
        SEEK: {
            value: string;
        };
        ASPI: {
            dataStart: string;
            dataLength: string;
            numPoints: string;
            bitsPerPoint: string;
            data: string;
        };
        IPLS: {
            encoding: number;
            value: string;
        };
        RVAD: {
            adjustment: string;
            bits: string;
            data: string;
        };
        EQUA: {
            adjustmentBits: string;
            data: string;
        };
    };
    getNames(): {
        TIT1: string;
        TIT2: string;
        TIT3: string;
        TALB: string;
        TOAL: string;
        TRCK: string;
        TPOS: string;
        TSST: string;
        TSRC: string;
        TPE1: string;
        TPE2: string;
        TPE3: string;
        TPE4: string;
        TOPE: string;
        TEXT: string;
        TOLY: string;
        TCOM: string;
        TMCL: string;
        TIPL: string;
        TENC: string;
        TBPM: string;
        TLEN: string;
        TKEY: string;
        TLAN: string;
        TCON: string;
        TFLT: string;
        TMED: string;
        TMOO: string;
        TCOP: string;
        TPRO: string;
        TPUB: string;
        TOWN: string;
        TRSN: string;
        TRSO: string;
        TOFN: string;
        TDLY: string;
        TDEN: string;
        TDOR: string;
        TDRC: string;
        TDRL: string;
        TDTG: string;
        TSSE: string;
        TSOA: string;
        TSOP: string;
        TSOT: string;
        TXXX: string;
        USLT: string;
        APIC: string;
        UFID: string;
        MCDI: string;
        COMM: string;
        WCOM: string;
        WCOP: string;
        WOAF: string;
        WOAR: string;
        WOAS: string;
        WORS: string;
        WPAY: string;
        WPUB: string;
        WXXX: string;
        PRIV: string;
        GEOB: string;
        PCNT: string;
        POPM: string;
        AENC: string;
        ETCO: string;
        MLLT: string;
        SYTC: string;
        SYLT: string;
        RVA2: string;
        EQU2: string;
        RVRB: string;
        RBUF: string;
        LINK: string;
        POSS: string;
        USER: string;
        OWNE: string;
        COMR: string;
        ENCR: string;
        GRID: string;
        SIGN: string;
        SEEK: string;
        ASPI: string;
        TDAT: string;
        TIME: string;
        TORY: string;
        TRDA: string;
        TSIZ: string;
        TYER: string;
        IPLS: string;
        RVAD: string;
        EQUA: string;
        TCMP: string;
        TSO2: string;
        TSOC: string;
    };
}
export declare class ID3v22Stream extends ID3v23Stream {
    private replacements;
    private frameReplacements;
    readHeader(): {
        identifier: any;
        length: number;
    };
}
