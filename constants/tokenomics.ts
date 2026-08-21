// Placeholder $GLAS token allocation. These figures are illustrative only —
// swap `value` (percentage points, should sum to 100) for the real
// allocation once it's finalized, without touching the chart/legend
// rendering code that consumes this.
export type TokenomicsSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export const TOKENOMICS_ALLOCATION: TokenomicsSlice[] = [
  { key: 'community', label: '커뮤니티 · 리워드', value: 30, color: '#B18CFF' },
  { key: 'reserve', label: '생태계 리저브', value: 22, color: '#E8C468' },
  { key: 'team', label: '팀 · 어드바이저', value: 18, color: '#6FD7C4' },
  { key: 'partnerships', label: '파트너 약국', value: 15, color: '#E07A9E' },
  { key: 'liquidity', label: '유동성 · 락업', value: 10, color: '#8C5CE0' },
  { key: 'public', label: '퍼블릭 세일', value: 5, color: '#C79A3D' },
];
