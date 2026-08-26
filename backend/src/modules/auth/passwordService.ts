import {
  randomBytes,
  type ScryptOptions,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

// promisify нь scrypt-ийн options-той overload-ыг таньдаггүй тул өөрөө боож өгнө.
const scrypt = (password: string, salt: Buffer, keylen: number, options: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keylen, options, (error, derivedKey) =>
      error ? reject(error) : resolve(derivedKey),
    );
  });

// Node-ийн built-in scrypt — native module (bcrypt/argon2) суулгах шаардлагагүй.
// scrypt нь санах ой шаарддаг KDF, OWASP-ийн зөвшөөрсөн сонголтуудын нэг.
// Native build байхгүй тул CI болон клиентийн машин дээр асуудал үүсэхгүй.
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
// OWASP-ийн scrypt зөвлөмж: N=2^17, r=8, p=1
const COST = 2 ** 17;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
// Дээрх параметрт 64MiB орчим хэрэгтэй — default 32MiB хязгаарыг өргөтгөнө.
const MAX_MEMORY = 192 * 1024 * 1024;

const PREFIX = "scrypt";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: MAX_MEMORY,
  });

  // Параметрийг хамт хадгална — хожим чангаруулахад хуучин hash-ууд ажилласаар байна.
  return [
    PREFIX,
    COST,
    BLOCK_SIZE,
    PARALLELISM,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== PREFIX) return false;

  const [, cost, blockSize, parallelism, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");

  const derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelism),
    maxmem: MAX_MEMORY,
  });

  // Тогтмол хугацааны харьцуулалт — timing attack-аас сэргийлнэ.
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
