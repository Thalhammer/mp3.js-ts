
const dctIV_scale = [];
for (let i = 0; i < 18; i++) {
	dctIV_scale[i] = 2 * Math.cos(Math.PI * (2 * i + 1) / (4 * 18));
}

const sdctII_scale = [];
for (let i = 0; i < 9; ++i) {
	sdctII_scale[i] = 2 * Math.cos(Math.PI * (2 * i + 1) / (2 * 18));
}

const c0 = 2 * Math.cos(1 * Math.PI / 18);
const c1 = 2 * Math.cos(3 * Math.PI / 18);
const c2 = 2 * Math.cos(4 * Math.PI / 18);
const c3 = 2 * Math.cos(5 * Math.PI / 18);
const c4 = 2 * Math.cos(7 * Math.PI / 18);
const c5 = 2 * Math.cos(8 * Math.PI / 18);
const c6 = 2 * Math.cos(16 * Math.PI / 18);


const fastsdct = function (x, y, offset) {
	let a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12;
	let a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25;
	let m0, m1, m2, m3, m4, m5, m6, m7;

	a0 = x[3] + x[5];
	a1 = x[3] - x[5];
	a2 = x[6] + x[2];
	a3 = x[6] - x[2];
	a4 = x[1] + x[7];
	a5 = x[1] - x[7];
	a6 = x[8] + x[0];
	a7 = x[8] - x[0];

	a8 = a0 + a2;
	a9 = a0 - a2;
	a10 = a0 - a6;
	a11 = a2 - a6;
	a12 = a8 + a6;
	a13 = a1 - a3;
	a14 = a13 + a7;
	a15 = a3 + a7;
	a16 = a1 - a7;
	a17 = a1 + a3;

	m0 = a17 * -c3;
	m1 = a16 * -c0;
	m2 = a15 * -c4;
	m3 = a14 * -c1;
	m4 = a5 * -c1;
	m5 = a11 * -c6;
	m6 = a10 * -c5;
	m7 = a9 * -c2;

	a18 = x[4] + a4;
	a19 = 2 * x[4] - a4;
	a20 = a19 + m5;
	a21 = a19 - m5;
	a22 = a19 + m6;
	a23 = m4 + m2;
	a24 = m4 - m2;
	a25 = m4 + m1;

	// output to every other slot for convenience
	y[offset + 0] = a18 + a12;
	y[offset + 2] = m0 - a25;
	y[offset + 4] = m7 - a20;
	y[offset + 6] = m3;
	y[offset + 8] = a21 - m6;
	y[offset + 10] = a24 - m1;
	y[offset + 12] = a12 - 2 * a18;
	y[offset + 14] = a23 + m0;
	y[offset + 16] = a22 + m7;
};

export class IMDCT {
	static readonly S = [
		/*  0 */[0.608761429,
			-0.923879533,
			-0.130526192,
			0.991444861,
			-0.382683432,
			-0.793353340],

		/*  6 */[-0.793353340,
			0.382683432,
			0.991444861,
			0.130526192,
		-0.923879533,
		-0.608761429],

		/*  1 */[0.382683432,
			-0.923879533,
			0.923879533,
			-0.382683432,
			-0.382683432,
			0.923879533],

		/*  7 */[-0.923879533,
		-0.382683432,
			0.382683432,
			0.923879533,
			0.923879533,
			0.382683432],

		/*  2 */[0.130526192,
			-0.382683432,
			0.608761429,
			-0.793353340,
			0.923879533,
			-0.991444861],

		/*  8 */[-0.991444861,
		-0.923879533,
		-0.793353340,
		-0.608761429,
		-0.382683432,
		-0.130526192]
	];

	private tmp_imdct36 = new Float64Array(18);
	private tmp_dctIV = new Float64Array(18);
	private tmp_sdctII = new Float64Array(9);

	constructor() {
	}

	// perform X[18]->x[36] IMDCT using Szu-Wei Lee's fast algorithm
	imdct36(x, y) {
		const tmp = this.tmp_imdct36;

		/* DCT-IV */
		this.dctIV(x, tmp);

		// convert 18-point DCT-IV to 36-point IMDCT
		for (let i = 0; i < 9; ++i) {
			y[i] = tmp[9 + i];
		}
		for (let i = 9; i < 27; ++i) {
			y[i] = -tmp[36 - (9 + i) - 1];
		}
		for (let i = 27; i < 36; ++i) {
			y[i] = -tmp[i - 27];
		}
	}

	dctIV(y, X) {
		const tmp = this.tmp_dctIV;

		// scaling
		for (let i = 0; i < 18; ++i) {
			tmp[i] = y[i] * dctIV_scale[i];
		}

		// SDCT-II
		this.sdctII(tmp, X);

		// scale reduction and output accumulation
		X[0] /= 2;
		for (let i = 1; i < 18; ++i) {
			X[i] = X[i] / 2 - X[i - 1];
		}
	}

	sdctII(x, X) {
		// divide the 18-point SDCT-II into two 9-point SDCT-IIs
		const tmp = this.tmp_sdctII;

		// even input butterfly
		for (let i = 0; i < 9; ++i) {
			tmp[i] = x[i] + x[18 - i - 1];
		}

		fastsdct(tmp, X, 0);

		// odd input butterfly and scaling
		for (let i = 0; i < 9; ++i) {
			tmp[i] = (x[i] - x[18 - i - 1]) * sdctII_scale[i];
		}

		fastsdct(tmp, X, 1);

		// output accumulation
		for (let i = 3; i < 18; i += 2) {
			X[i] -= X[i - 2];
		}
	}
}
