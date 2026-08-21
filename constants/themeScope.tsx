import { createContext, useContext } from 'react';

// The app is light-by-default now (see theme.ts), with a handful of screens
// deliberately kept on the original dark "premium glass" treatment: the
// Wallet tab, payment/checkout modals, the admin dashboard, and the side
// link-tree panel. Rather than threading a `dark` prop through every
// GlassSurface/PillButton/etc call site, those screens wrap themselves once
// in <DarkScope> and every shared primitive reads this context internally.
const DarkScopeContext = createContext(false);

export function useIsDarkScope(): boolean {
  return useContext(DarkScopeContext);
}

export function DarkScope({ children }: { children: React.ReactNode }) {
  return <DarkScopeContext.Provider value={true}>{children}</DarkScopeContext.Provider>;
}
