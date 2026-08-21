// Bare fallback purely so `tsc` (which doesn't know about Metro's platform-
// suffix resolution) can type-check the bare `./TokenomicsChart` import in
// SidePanel.tsx. Metro itself always prefers TokenomicsChart.web.tsx /
// TokenomicsChart.native.tsx over this file when either exists, for
// whichever platform it's bundling — this file is never actually bundled.
export { default } from './TokenomicsChart.native';
