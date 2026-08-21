# Video assets

`hero-placeholder.mp4` is a **placeholder only** — a CC0 (public domain) sample
clip from MDN's `cc0-videos` collection
(https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4),
used here purely to wire up the muted/autoplay/loop video slide in the home
banner carousel (`components/glass/HomeCarousel.tsx`).

Before shipping for real, swap this file for licensed footage — either a
self-shot clip or a properly licensed Pexels/Pixabay download — and keep the
filename (or update the `require()` in `HomeCarousel.tsx`) so the rest of the
wiring doesn't need to change.
