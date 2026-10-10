// Deck <-> URL fragment: JSON {t: title, c: [[front, back], ...]} -> "z=<deflate-raw, base64url>" (or "t=<utf8, base64url>" fallback).
const b64 = {
  enc: bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec: str => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
};
async function pipe(bytes, stream) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
}
async function encodeDeck(deck) {
  const bytes = new TextEncoder().encode(JSON.stringify({ t: deck.title, c: deck.cards }));
  if (typeof CompressionStream === 'undefined') return 't=' + b64.enc(bytes);
  return 'z=' + b64.enc(await pipe(bytes, new CompressionStream('deflate-raw')));
}
async function decodeDeck(frag) {
  const kind = frag.slice(0, 2), data = b64.dec(frag.slice(2));
  let bytes;
  if (kind === 't=') bytes = data;
  else if (kind === 'z=') bytes = await pipe(data, new DecompressionStream('deflate-raw'));
  else throw new Error('Unrecognized link format');
  const o = JSON.parse(new TextDecoder().decode(bytes));
  if (!Array.isArray(o.c)) throw new Error('bad deck');
  return { title: String(o.t || ''), cards: o.c.map(p => [String(p[0] ?? ''), String(p[1] ?? '')]) };
}
