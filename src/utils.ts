export function makeArray(lengths: number[], Type?) {
	if (!Type) { Type = Float64Array; }

	if (lengths.length === 1) {
		return new Type(lengths[0]);
	}

	const ret = [];
	const len = lengths[0];

	for (let j = 0; j < len; j++) {
		ret[j] = makeArray(lengths.slice(1), Type);
	}

	return ret;
}
