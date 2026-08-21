import { create } from 'zustand';

import { PaymentVariant } from '@/components/glass/PaymentFlowModal';

type SheetKind = 'wallet-action' | 'composer' | 'payment' | null;

type UiState = {
  activeSheet: SheetKind;
  walletActionMode: 'buy' | 'stake';
  paymentVariant: PaymentVariant | null;
  paymentOnSuccess: (() => void) | null;

  openWalletAction: (mode: 'buy' | 'stake') => void;
  openComposer: () => void;
  openPayment: (variant: PaymentVariant, onSuccess?: () => void) => void;
  closeSheet: () => void;
};

// All bottom sheets/modals are rendered once at the app root (see
// GlobalSheets.tsx), never nested inside a tab screen. Screens that are
// descendants of the Tabs navigator can't out-rank the floating tab bar's
// stacking just by raising their own z-index, so any modal rendered deep
// inside a screen risks painting underneath it — this store is how a
// screen asks the root-level host to open something instead.
export const useUiStore = create<UiState>((set) => ({
  activeSheet: null,
  walletActionMode: 'buy',
  paymentVariant: null,
  paymentOnSuccess: null,

  openWalletAction: (mode) => set({ activeSheet: 'wallet-action', walletActionMode: mode }),
  openComposer: () => set({ activeSheet: 'composer' }),
  openPayment: (variant, onSuccess) =>
    set({ activeSheet: 'payment', paymentVariant: variant, paymentOnSuccess: onSuccess ?? null }),
  closeSheet: () => set({ activeSheet: null }),
}));
