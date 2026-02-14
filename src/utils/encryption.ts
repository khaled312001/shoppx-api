import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = process.env.ENCRYPTION_KEY;

/**
 * Encrypts a given text using AES-256-CBC.
 * @param text - The plain text to be encrypted.
 * @returns The encrypted text, including the IV, in the format `iv:encryptedText`.
 */
export function encrypt(text: string): string {
  if (!key || key.length !== 32) {
    throw new Error(
      "Encryption key must be a 32-byte string. Please set ENCRYPTION_KEY in your environment."
    );
  }
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

  let encrypted = cipher.update(text, "utf-8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Return the IV and the encrypted text, both in hex format, separated by a colon.
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a given encrypted text using AES-256-CBC.
 * @param encryptedText - The encrypted text in the format `iv:encryptedText`.
 * @returns The decrypted plain text.
 */
export function decrypt(encryptedText: string): string {
  try {
    if (!key || key.length !== 32) {
      throw new Error(
        "Encryption key must be a 32-byte string. Please set ENCRYPTION_KEY in your environment."
      );
    }

    const [ivHex, encryptedHex] = encryptedText.split(":");

    if (!ivHex || !encryptedHex) {
      throw new Error(
        "Invalid encrypted text format. It should be in the format `iv:encryptedText`."
      );
    }

    const iv = Buffer.from(ivHex, "hex");
    const encryptedBuffer = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);

    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf-8");
  } catch (error: any) {
    console.error("Decryption failed:", error.message);
    throw new Error("Failed to decrypt the provided text.");
  }
}
