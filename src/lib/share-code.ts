// 공유 링크 코드. 혼동하기 쉬운 문자(0/O, 1/I/l)는 제외한다.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const CODE_LENGTH = 8;

export function generateShareCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export function isValidShareCode(code: string): boolean {
  return new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`).test(code);
}

export function buildShareUrl(code: string, origin: string): string {
  return `${origin.replace(/\/$/, '')}/s/${code}`;
}
