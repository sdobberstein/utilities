# Utilities

Static site (no build step) for GitHub Pages. A landing page (`index.html`) links to each tool in its own folder.

## Run locally
    python3 -m http.server   # then open http://localhost:8000

## Publish
Push to GitHub, then Settings → Pages → Deploy from branch → `main` / root.

## Adding a tool
Create a folder with an `index.html` (use `../assets/style.css`) and add a card to the root `index.html`.

## Tools
- `timer/` — countdown timer. `timer/view.html#<ISO UTC date>[&title=Text]` shows the countdown; `timer/` builds the link.
- `markdown/` — client-side markdown editor with live preview (autosaves to localStorage). Uses vendored `marked` + `DOMPurify` in `assets/vendor/`.
- `encrypt/` — password-encrypted message in a link (PBKDF2-SHA256 600k iterations + AES-256-GCM via WebCrypto, all client-side). `encrypt/view.html#<data>` prompts for the password.
- `jig-weights/` — oz ↔ g reference tables for common jig sizes, plus a live converter.
- `flashcards/` — deck of cards encoded in the URL fragment (deflate + base64url). `flashcards/view.html#<deck>` shuffles and opens a study view (flip, got it / again).
