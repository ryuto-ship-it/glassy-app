import { create } from 'zustand';

import { PaymentVariant } from '@/components/glass/PaymentFlowModal';
import { Transaction } from '@/data/mock';

type SheetKind = 'wallet-action' | 'composer' | 'payment' | 'groupbuy-create' | 'receipt' | null;

type UiState = {
  activeSheet: SheetKind;
  walletActionMode: 'buy' | 'stake';
  paymentVariant: PaymentVariant | null;
  paymentOnSuccess: (() => void) | null;
  receiptTx: Transaction | null;
  // Shown once per app session on first Home mount, and re-visitable anytime
  // from the Profile tab ("웰컴 플로우 다시보기") for demo purposes.
  hasSeenWelcome: boolean;

  openWalletAction: (mode: 'buy' | 'stake') => void;
  openComposer: () => void;
  openPayment: (variant: PaymentVariant, onSuccess?: () => void) => void;
  openGroupBuyCreate: () => void;
  openReceipt: (tx: Transaction) => void;
  closeSheet: () => void;
  markWelcomeSeen: () => void;
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
  receiptTx: null,
  hasSeenWelcome: false,

  openWalletAction: (mode) => set({ activeSheet: 'wallet-action', walletActionMode: mode }),
  openComposer: () => set({ activeSheet: 'composer' }),
  openPayment: (variant, onSuccess) =>
    set({ activeSheet: 'payment', paymentVariant: variant, paymentOnSuccess: onSuccess ?? null }),
  openGroupBuyCreate: () => set({ activeSheet: 'groupbuy-create' }),
  openReceipt: (tx) => set({ activeSheet: 'receipt', receiptTx: tx }),
  closeSheet: () => set({ activeSheet: null }),
  markWelcomeSeen: () => set({ hasSeenWelcome: true }),
}));
