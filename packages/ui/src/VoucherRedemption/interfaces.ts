export interface RedemptionCardProps {
  code: string;
  discount: string;
  partnerName: string;
  copyButtonText?: string;
  onCopyCode?: () => void;
  expiryDate?: string;
  className?: string;
  isCopied?: boolean;
}

export interface VoucherSummaryProps {
  image: React.ReactElement;
  title: string | HTMLElement;
  subtitle?: string;
  description?: string;
  className?: string;
}
