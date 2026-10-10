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
