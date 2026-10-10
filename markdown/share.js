// Encode/decode markdown for the URL fragment: "z=<deflate-raw, base64url>" (or "t=<utf8, base64url>" fallback).
const b64 = {
  enc: bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec: str => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
};
async function pipe(bytes, stream) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
}
async function encodeMarkdown(text) {
  const bytes = new TextEncoder().encode(text);
  if (typeof CompressionStream === 'undefined') return 't=' + b64.enc(bytes);
  return 'z=' + b64.enc(await pipe(bytes, new CompressionStream('deflate-raw')));
}
async function decodeMarkdown(frag) {
  const kind = frag.slice(0, 2), data = b64.dec(frag.slice(2));
  if (kind === 't=') return new TextDecoder().decode(data);
  if (kind === 'z=') return new TextDecoder().decode(await pipe(data, new DecompressionStream('deflate-raw')));
  throw new Error('Unrecognized link format');
}
