import * as AV from 'aurora-js-ts';

const ENCODINGS = ['latin1', 'utf16-bom', 'utf16-be', 'utf8'];

export abstract class ID3Stream extends AV.Base {
	protected header: {
		version: string;
		major: number;
		minor: number;
		flags: number;
		length: number;
	};
	protected stream: AV.Stream;
	protected offset = 0;
	private data: { [idx: string]: any[] };

	constructor(header, stream: AV.Stream) {
		super();
		this.header = header;
		this.stream = stream;
	}

	read() {
		if (!this.data) {
			this.data = {};

			// read all frames
			let frame;
			while (frame = this.readFrame()) {
				// if we already have an instance of this key, add it to an array
				if (frame.key in this.data) {
					if (!Array.isArray(this.data[frame.key])) { this.data[frame.key] = [this.data[frame.key]]; }

					this.data[frame.key].push(frame.value);
				} else {
					this.data[frame.key] = frame.value;
				}
			}
		}

		return this.data;
	}

	abstract readHeader(): any;
	protected abstract getFrameTypes(): any;
	protected abstract getNames(): any;
	protected abstract getMap(): any;

	readFrame() {
		if (this.offset >= this.header.length) { return null; }

		// get the header
		const header = this.readHeader();
		let decoder = header.identifier;
		const frameTypes = this.getFrameTypes();
		const names = this.getNames();
		const map = this.getMap();

		if (header.identifier.charCodeAt(0) === 0) {
			this.offset += this.header.length + 1;
			return null;
		}

		// map common frame names to a single type
		if (!frameTypes[decoder]) {
			for (const key in map) {
				if (!map.hasOwnProperty(key)) { continue; }
				if (map[key].indexOf(decoder) !== -1) {
					decoder = key;
					break;
				}
			}
		}

		let result: {
			value: any;
			key: string;
		};

		if (frameTypes[decoder]) {
			// decode the frame
			let frame = this.decodeFrame(header, frameTypes[decoder]);
			const keys = Object.keys(frame);

			// if it only returned one key, use that as the value
			if (keys.length === 1) { frame = frame[keys[0]]; }

			result = {
				value: frame,
				key: ''
			};

		} else {
			// No frame type found, treat it as binary
			result = {
				value: this.stream.readBuffer(Math.min(header.length, this.header.length - this.offset)),
				key: ''
			};
		}

		result.key = names[header.identifier] ? names[header.identifier] : header.identifier;

		// special sauce for cover art, which should just be a buffer
		if (result.key === 'coverArt') { result.value = result.value.data; }

		this.offset += 10 + header.length;
		return result;
	}

	decodeFrame(header, fields) {
		const stream = this.stream;
		const start = stream.offset;
		const ret: any = {};
		const len = Object.keys(fields).length;

		let encoding = 0;
		let i = 0;
		let rest: number;
		for (const key in fields) {
			if (!fields.hasOwnProperty(key)) { continue; }
			const type = fields[key];
			rest = header.length - (stream.offset - start);
			i++;

			// check for special field names
			switch (key) {
				case 'encoding':
					encoding = stream.readUInt8();
					continue;

				case 'language':
					ret.language = stream.readString(3);
					continue;
			}

			// check types
			switch (type) {
				case 'latin1':
					ret[key] = stream.readString(i === len ? rest : null, 'latin1');
					break;

				case 'string':
					ret[key] = stream.readString(i === len ? rest : null, ENCODINGS[encoding]);
					break;

				case 'binary':
					ret[key] = stream.readBuffer(rest);
					break;

				case 'int16':
					ret[key] = stream.readInt16();
					break;

				case 'int8':
					ret[key] = stream.readInt8();
					break;

				case 'int24':
					ret[key] = stream.readInt24();
					break;

				case 'int32':
					ret[key] = stream.readInt32();
					break;

				case 'int32+':
					ret[key] = stream.readInt32();
					if (rest > 4) { throw new Error('Seriously dude? Stop playing this song and get a life!'); }

					break;

				case 'date':
					const val = stream.readString(8);
					ret[key] = new Date(
						parseInt(val.slice(0, 4), 10),
						parseInt(val.slice(4, 6), 10) - 1,
						parseInt(val.slice(6, 8), 10));
					break;

				case 'frame_id':
					ret[key] = stream.readString(4);
					break;

				default:
					throw new Error('Unknown key type ' + type);
			}
		}

		// Just in case something went wrong...
		rest = header.length - (stream.offset - start);
		if (rest > 0) { stream.advance(rest); }

		return ret;
	}
}

// ID3 v2.3 and v2.4 support
export class ID3v23Stream extends ID3Stream {


	private frameTypes = {
		text: {
			encoding: 1,
			value: 'string'
		},

		url: {
			value: 'latin1'
		},

		TXXX: {
			encoding: 1,
			description: 'string',
			value: 'string'
		},

		WXXX: {
			encoding: 1,
			description: 'string',
			value: 'latin1',
		},

		USLT: {
			encoding: 1,
			language: 1,
			description: 'string',
			value: 'string'
		},

		COMM: {
			encoding: 1,
			language: 1,
			description: 'string',
			value: 'string'
		},

		APIC: {
			encoding: 1,
			mime: 'latin1',
			type: 'int8',
			description: 'string',
			data: 'binary'
		},

		UFID: {
			owner: 'latin1',
			identifier: 'binary'
		},

		MCDI: {
			value: 'binary'
		},

		PRIV: {
			owner: 'latin1',
			value: 'binary'
		},

		GEOB: {
			encoding: 1,
			mime: 'latin1',
			filename: 'string',
			description: 'string',
			data: 'binary'
		},

		PCNT: {
			value: 'int32+'
		},

		POPM: {
			email: 'latin1',
			rating: 'int8',
			counter: 'int32+'
		},

		AENC: {
			owner: 'latin1',
			previewStart: 'int16',
			previewLength: 'int16',
			encryptionInfo: 'binary'
		},

		ETCO: {
			format: 'int8',
			data: 'binary'  // TODO
		},

		MLLT: {
			framesBetweenReference: 'int16',
			bytesBetweenReference: 'int24',
			millisecondsBetweenReference: 'int24',
			bitsForBytesDeviation: 'int8',
			bitsForMillisecondsDev: 'int8',
			data: 'binary' // TODO
		},

		SYTC: {
			format: 'int8',
			tempoData: 'binary' // TODO
		},

		SYLT: {
			encoding: 1,
			language: 1,
			format: 'int8',
			contentType: 'int8',
			description: 'string',
			data: 'binary' // TODO
		},

		RVA2: {
			identification: 'latin1',
			data: 'binary' // TODO
		},

		EQU2: {
			interpolationMethod: 'int8',
			identification: 'latin1',
			data: 'binary' // TODO
		},

		RVRB: {
			left: 'int16',
			right: 'int16',
			bouncesLeft: 'int8',
			bouncesRight: 'int8',
			feedbackLL: 'int8',
			feedbackLR: 'int8',
			feedbackRR: 'int8',
			feedbackRL: 'int8',
			premixLR: 'int8',
			premixRL: 'int8'
		},

		RBUF: {
			size: 'int24',
			flag: 'int8',
			offset: 'int32'
		},

		LINK: {
			identifier: 'frame_id',
			url: 'latin1',
			data: 'binary' // TODO stringlist?
		},

		POSS: {
			format: 'int8',
			position: 'binary' // TODO
		},

		USER: {
			encoding: 1,
			language: 1,
			value: 'string'
		},

		OWNE: {
			encoding: 1,
			price: 'latin1',
			purchaseDate: 'date',
			seller: 'string'
		},

		COMR: {
			encoding: 1,
			price: 'latin1',
			validUntil: 'date',
			contactURL: 'latin1',
			receivedAs: 'int8',
			seller: 'string',
			description: 'string',
			logoMime: 'latin1',
			logo: 'binary'
		},

		ENCR: {
			owner: 'latin1',
			methodSymbol: 'int8',
			data: 'binary'
		},

		GRID: {
			owner: 'latin1',
			groupSymbol: 'int8',
			data: 'binary'
		},

		SIGN: {
			groupSymbol: 'int8',
			signature: 'binary'
		},

		SEEK: {
			value: 'int32'
		},

		ASPI: {
			dataStart: 'int32',
			dataLength: 'int32',
			numPoints: 'int16',
			bitsPerPoint: 'int8',
			data: 'binary' // TODO
		},

		// Deprecated ID3 v2.3 frames
		IPLS: {
			encoding: 1,
			value: 'string' // list?
		},

		RVAD: {
			adjustment: 'int8',
			bits: 'int8',
			data: 'binary' // TODO
		},

		EQUA: {
			adjustmentBits: 'int8',
			data: 'binary' // TODO
		}
	};

	private map = {
		text: [
			// Identification Frames
			'TIT1', 'TIT2', 'TIT3', 'TALB', 'TOAL', 'TRCK', 'TPOS', 'TSST', 'TSRC',

			// Involved Persons Frames
			'TPE1', 'TPE2', 'TPE3', 'TPE4', 'TOPE', 'TEXT', 'TOLY', 'TCOM', 'TMCL', 'TIPL', 'TENC',

			// Derived and Subjective Properties Frames
			'TBPM', 'TLEN', 'TKEY', 'TLAN', 'TCON', 'TFLT', 'TMED', 'TMOO',

			// Rights and Licence Frames
			'TCOP', 'TPRO', 'TPUB', 'TOWN', 'TRSN', 'TRSO',

			// Other Text Frames
			'TOFN', 'TDLY', 'TDEN', 'TDOR', 'TDRC', 'TDRL', 'TDTG', 'TSSE', 'TSOA', 'TSOP', 'TSOT',

			// Deprecated Text Frames
			'TDAT', 'TIME', 'TORY', 'TRDA', 'TSIZ', 'TYER',

			// Non-standard iTunes Frames
			'TCMP', 'TSO2', 'TSOC'
		],

		url: [
			'WCOM', 'WCOP', 'WOAF', 'WOAR', 'WOAS', 'WORS', 'WPAY', 'WPUB'
		]
	};

	private names = {
		// Identification Frames
		'TIT1': 'grouping',
		'TIT2': 'title',
		'TIT3': 'subtitle',
		'TALB': 'album',
		'TOAL': 'originalAlbumTitle',
		'TRCK': 'trackNumber',
		'TPOS': 'diskNumber',
		'TSST': 'setSubtitle',
		'TSRC': 'ISRC',

		// Involved Persons Frames
		'TPE1': 'artist',
		'TPE2': 'albumArtist',
		'TPE3': 'conductor',
		'TPE4': 'modifiedBy',
		'TOPE': 'originalArtist',
		'TEXT': 'lyricist',
		'TOLY': 'originalLyricist',
		'TCOM': 'composer',
		'TMCL': 'musicianCreditsList',
		'TIPL': 'involvedPeopleList',
		'TENC': 'encodedBy',

		// Derived and Subjective Properties Frames
		'TBPM': 'tempo',
		'TLEN': 'length',
		'TKEY': 'initialKey',
		'TLAN': 'language',
		'TCON': 'genre',
		'TFLT': 'fileType',
		'TMED': 'mediaType',
		'TMOO': 'mood',

		// Rights and Licence Frames
		'TCOP': 'copyright',
		'TPRO': 'producedNotice',
		'TPUB': 'publisher',
		'TOWN': 'fileOwner',
		'TRSN': 'internetRadioStationName',
		'TRSO': 'internetRadioStationOwner',

		// Other Text Frames
		'TOFN': 'originalFilename',
		'TDLY': 'playlistDelay',
		'TDEN': 'encodingTime',
		'TDOR': 'originalReleaseTime',
		'TDRC': 'recordingTime',
		'TDRL': 'releaseTime',
		'TDTG': 'taggingTime',
		'TSSE': 'encodedWith',
		'TSOA': 'albumSortOrder',
		'TSOP': 'performerSortOrder',
		'TSOT': 'titleSortOrder',

		// User defined text information
		'TXXX': 'userText',

		// Unsynchronised lyrics/text transcription
		'USLT': 'lyrics',

		// Attached Picture Frame
		'APIC': 'coverArt',

		// Unique Identifier Frame
		'UFID': 'uniqueIdentifier',

		// Music CD Identifier Frame
		'MCDI': 'CDIdentifier',

		// Comment Frame
		'COMM': 'comments',

		// URL link frames
		'WCOM': 'commercialInformation',
		'WCOP': 'copyrightInformation',
		'WOAF': 'officialAudioFileWebpage',
		'WOAR': 'officialArtistWebpage',
		'WOAS': 'officialAudioSourceWebpage',
		'WORS': 'officialInternetRadioStationHomepage',
		'WPAY': 'payment',
		'WPUB': 'officialPublisherWebpage',

		// User Defined URL Link Frame
		'WXXX': 'url',

		'PRIV': 'private',
		'GEOB': 'generalEncapsulatedObject',
		'PCNT': 'playCount',
		'POPM': 'rating',
		'AENC': 'audioEncryption',
		'ETCO': 'eventTimingCodes',
		'MLLT': 'MPEGLocationLookupTable',
		'SYTC': 'synchronisedTempoCodes',
		'SYLT': 'synchronisedLyrics',
		'RVA2': 'volumeAdjustment',
		'EQU2': 'equalization',
		'RVRB': 'reverb',
		'RBUF': 'recommendedBufferSize',
		'LINK': 'link',
		'POSS': 'positionSynchronisation',
		'USER': 'termsOfUse',
		'OWNE': 'ownership',
		'COMR': 'commercial',
		'ENCR': 'encryption',
		'GRID': 'groupIdentifier',
		'SIGN': 'signature',
		'SEEK': 'seek',
		'ASPI': 'audioSeekPointIndex',

		// Deprecated ID3 v2.3 frames
		'TDAT': 'date',
		'TIME': 'time',
		'TORY': 'originalReleaseYear',
		'TRDA': 'recordingDates',
		'TSIZ': 'size',
		'TYER': 'year',
		'IPLS': 'involvedPeopleList',
		'RVAD': 'volumeAdjustment',
		'EQUA': 'equalization',

		// Non-standard iTunes frames
		'TCMP': 'compilation',
		'TSO2': 'albumArtistSortOrder',
		'TSOC': 'composerSortOrder'
	};

	readHeader(): any {
		const identifier = this.stream.readString(4);
		let length = 0;

		if (this.header.major === 4) {
			for (let i = 0; i < 4; i++) { length = (length << 7) + (this.stream.readUInt8() & 0x7f); }
		} else {
			length = this.stream.readUInt32();
		}

		return {
			identifier: identifier,
			length: length,
			flags: this.stream.readUInt16()
		};
	}

	getMap() {
		return this.map;
	}

	getFrameTypes() {
		return this.frameTypes;
	}

	getNames() {
		return this.names;
	}
}

// ID3 v2.2 support
export class ID3v22Stream extends ID3v23Stream {
	// map 3 char ID3 v2.2 names to 4 char ID3 v2.3/4 names
	private replacements = {
		'UFI': 'UFID',
		'TT1': 'TIT1',
		'TT2': 'TIT2',
		'TT3': 'TIT3',
		'TP1': 'TPE1',
		'TP2': 'TPE2',
		'TP3': 'TPE3',
		'TP4': 'TPE4',
		'TCM': 'TCOM',
		'TXT': 'TEXT',
		'TLA': 'TLAN',
		'TCO': 'TCON',
		'TAL': 'TALB',
		'TPA': 'TPOS',
		'TRK': 'TRCK',
		'TRC': 'TSRC',
		'TYE': 'TYER',
		'TDA': 'TDAT',
		'TIM': 'TIME',
		'TRD': 'TRDA',
		'TMT': 'TMED',
		'TFT': 'TFLT',
		'TBP': 'TBPM',
		'TCR': 'TCOP',
		'TPB': 'TPUB',
		'TEN': 'TENC',
		'TSS': 'TSSE',
		'TOF': 'TOFN',
		'TLE': 'TLEN',
		'TSI': 'TSIZ',
		'TDY': 'TDLY',
		'TKE': 'TKEY',
		'TOT': 'TOAL',
		'TOA': 'TOPE',
		'TOL': 'TOLY',
		'TOR': 'TORY',
		'TXX': 'TXXX',

		'WAF': 'WOAF',
		'WAR': 'WOAR',
		'WAS': 'WOAS',
		'WCM': 'WCOM',
		'WCP': 'WCOP',
		'WPB': 'WPUB',
		'WXX': 'WXXX',

		'IPL': 'IPLS',
		'MCI': 'MCDI',
		'ETC': 'ETCO',
		'MLL': 'MLLT',
		'STC': 'SYTC',
		'ULT': 'USLT',
		'SLT': 'SYLT',
		'COM': 'COMM',
		'RVA': 'RVAD',
		'EQU': 'EQUA',
		'REV': 'RVRB',

		'GEO': 'GEOB',
		'CNT': 'PCNT',
		'POP': 'POPM',
		'BUF': 'RBUF',
		'CRA': 'AENC',
		'LNK': 'LINK',

		// iTunes stuff
		'TST': 'TSOT',
		'TSP': 'TSOP',
		'TSA': 'TSOA',
		'TCP': 'TCMP',
		'TS2': 'TSO2',
		'TSC': 'TSOC'
	};

	// replacements for ID3 v2.3/4 frames
	private frameReplacements = {
		PIC: {
			encoding: 1,
			format: 'int24',
			type: 'int8',
			description: 'string',
			data: 'binary'
		},

		CRM: {
			owner: 'latin1',
			description: 'latin1',
			data: 'binary'
		}
	};

	readHeader() {
		const id = this.stream.readString(3);
		const frameTypes = this.getFrameTypes();

		if (this.frameReplacements[id] && !frameTypes[id]) { frameTypes[id] = this.frameReplacements[id]; }

		return {
			identifier: this.replacements[id] || id,
			length: this.stream.readUInt24()
		};
	}
}
