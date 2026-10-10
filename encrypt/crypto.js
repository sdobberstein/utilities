// Password-based encryption for URL fragments.
// Format (base64url): [version=1][salt 16][iv 12][AES-GCM ciphertext+tag]. Key: PBKDF2-SHA256 -> AES-256-GCM.
const ITER = 600000;
const b64 = {
  enc: bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec: str => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
};
async function deriveKey(password, salt) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encryptText(text, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new Uint8Array([1]) }, key, new TextEncoder().encode(text)));
  const out = new Uint8Array(1 + 16 + 12 + ct.length);
  out[0] = 1; out.set(salt, 1); out.set(iv, 17); out.set(ct, 29);
  return b64.enc(out);
}
// Throws on wrong password or corrupted data.
async function decryptText(frag, password) {
  const data = b64.dec(frag);
  if (data[0] !== 1 || data.length < 46) throw new Error('format');
  const key = await deriveKey(password, data.slice(1, 17));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.slice(17, 29), additionalData: new Uint8Array([1]) }, key, data.slice(29));
  return new TextDecoder().decode(pt);
}
