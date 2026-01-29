const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()_+-=[]{}|;:',.<>?/\\`~\"";

function charsetsize(password: string): number {
	let size = 0;
	let hasLower = false;
	let hasUpper = false;
	let hasDigit = false;
	let hasSpecial = false;
	let hasOther = false;

	for (const char of password) {
		if (!hasLower && LOWERCASE.includes(char)) {
			hasLower = true;
			size += 26;
		} else if (!hasUpper && UPPERCASE.includes(char)) {
			hasUpper = true;
			size += 26;
		} else if (!hasDigit && DIGITS.includes(char)) {
			hasDigit = true;
			size += 10;
		} else if (!hasSpecial && SPECIAL.includes(char)) {
			hasSpecial = true;
			size += 32;
		} else if (!hasOther && !LOWERCASE.includes(char) && !UPPERCASE.includes(char) && !DIGITS.includes(char) && !SPECIAL.includes(char)) {
			hasOther = true;
			size += 100;
		}
	}

	return size || 1;
}

export function calculateentropy(password: string): number {
	if (!password || password.length === 0) return 0;
	const poolsize = charsetsize(password);
	const entropy = password.length * Math.log2(poolsize);
	return Math.round(entropy * 100) / 100;
}

export function entropyrating(bits: number): "very weak" | "weak" | "fair" | "strong" | "very strong" {
	if (bits < 28) return "very weak";
	if (bits < 36) return "weak";
	if (bits < 60) return "fair";
	if (bits < 128) return "strong";
	return "very strong";
}
