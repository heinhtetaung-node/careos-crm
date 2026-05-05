export interface TabProps {
  component: React.ReactNode;
  title: string;
  hideBadge?: boolean;
  label?: string;
  labelColor?: 'default' | 'primary' | 'white' | 'success' | 'danger';
}
