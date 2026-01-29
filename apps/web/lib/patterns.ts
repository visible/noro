const KEYBOARDS = [
	"qwertyuiop",
	"asdfghjkl",
	"zxcvbnm",
	"qazwsxedc",
	"rfvtgbyhn",
	"1234567890",
	"0987654321",
	"!@#$%^&*()",
];

const COMMON = [
	"password",
	"123456",
	"qwerty",
	"admin",
	"letmein",
	"welcome",
	"monkey",
	"dragon",
	"master",
	"login",
	"abc123",
	"passw0rd",
	"iloveyou",
	"trustno1",
	"sunshine",
	"princess",
	"football",
	"baseball",
	"shadow",
	"superman",
	"michael",
	"jennifer",
	"hunter",
	"batman",
];

export type Pattern = {
	type: "keyboard" | "sequence" | "repeat" | "date" | "common" | "word";
	match: string;
	position: number;
};

function keyboardwalk(password: string): Pattern[] {
	const patterns: Pattern[] = [];
	const lower = password.toLowerCase();

	for (const row of KEYBOARDS) {
		for (let len = 4; len <= row.length; len++) {
			for (let start = 0; start <= row.length - len; start++) {
				const seq = row.slice(start, start + len);
				const rev = seq.split("").reverse().join("");
				const idx = lower.indexOf(seq);
				const ridx = lower.indexOf(rev);

				if (idx !== -1) {
					patterns.push({ type: "keyboard", match: seq, position: idx });
				}
				if (ridx !== -1 && ridx !== idx) {
					patterns.push({ type: "keyboard", match: rev, position: ridx });
				}
			}
		}
	}

	return patterns;
}

function sequences(password: string): Pattern[] {
	const patterns: Pattern[] = [];
	const lower = password.toLowerCase();

	for (let i = 0; i < lower.length - 2; i++) {
		let ascending = 1;
		let descending = 1;

		for (let j = i + 1; j < lower.length; j++) {
			if (lower.charCodeAt(j) === lower.charCodeAt(j - 1) + 1) {
				ascending++;
			} else {
				break;
			}
		}

		for (let j = i + 1; j < lower.length; j++) {
			if (lower.charCodeAt(j) === lower.charCodeAt(j - 1) - 1) {
				descending++;
			} else {
				break;
			}
		}

		if (ascending >= 4) {
			patterns.push({ type: "sequence", match: lower.slice(i, i + ascending), position: i });
		}
		if (descending >= 4) {
			patterns.push({ type: "sequence", match: lower.slice(i, i + descending), position: i });
		}
	}

	return patterns;
}

function repeats(password: string): Pattern[] {
	const patterns: Pattern[] = [];
	let i = 0;

	while (i < password.length) {
		let count = 1;
		while (i + count < password.length && password[i] === password[i + count]) {
			count++;
		}
		if (count >= 3) {
			patterns.push({ type: "repeat", match: password.slice(i, i + count), position: i });
		}
		i += count;
	}

	const lower = password.toLowerCase();
	for (let len = 2; len <= Math.floor(lower.length / 2); len++) {
		for (let start = 0; start <= lower.length - len * 2; start++) {
			const chunk = lower.slice(start, start + len);
			const rest = lower.slice(start + len);
			if (rest.startsWith(chunk)) {
				patterns.push({ type: "repeat", match: chunk + chunk, position: start });
			}
		}
	}

	return patterns;
}

function dates(password: string): Pattern[] {
	const patterns: Pattern[] = [];
	const datePatterns = [
		/\b(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\b/g,
		/\b(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(19|20)\d{2}\b/g,
		/\b(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(19|20)\d{2}\b/g,
		/\b(19|20)\d{2}\b/g,
		/\b(0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])[\/\-](\d{2}|\d{4})\b/g,
	];

	for (const pattern of datePatterns) {
		let match;
		while ((match = pattern.exec(password)) !== null) {
			patterns.push({ type: "date", match: match[0], position: match.index });
		}
	}

	return patterns;
}

function commonwords(password: string): Pattern[] {
	const patterns: Pattern[] = [];
	const lower = password.toLowerCase();

	for (const word of COMMON) {
		let idx = lower.indexOf(word);
		while (idx !== -1) {
			patterns.push({ type: "common", match: word, position: idx });
			idx = lower.indexOf(word, idx + 1);
		}
	}

	return patterns;
}

export function detectpatterns(password: string): Pattern[] {
	if (!password) return [];

	const all = [
		...keyboardwalk(password),
		...sequences(password),
		...repeats(password),
		...dates(password),
		...commonwords(password),
	];

	const unique = all.filter((p, i, arr) =>
		arr.findIndex((x) => x.type === p.type && x.match === p.match && x.position === p.position) === i
	);

	return unique.sort((a, b) => a.position - b.position);
}

export function hasweakpatterns(password: string): boolean {
	const patterns = detectpatterns(password);
	return patterns.length > 0;
}
