import { clsx } from 'clsx';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { TaskStatus } from '../../types';

interface BadgeProps {
  status: TaskStatus;
  className?: string;
}

const config: Record<TaskStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock size={11} />,
    cls: 'badge-pending',
  },
  processing: {
    label: 'Diproses',
    icon: <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />,
    cls: 'badge-processing',
  },
  success: {
    label: 'Sukses',
    icon: <CheckCircle2 size={11} />,
    cls: 'badge-success',
  },
  failed: {
    label: 'Gagal',
    icon: <XCircle size={11} />,
    cls: 'badge-failed',
  },
};

export function StatusBadge({ status, className }: BadgeProps) {
  const badgeConfig = config[status] || {
    label: status || 'Unknown',
    icon: <Clock size={11} />,
    cls: 'badge-pending'
  };
  const { label, icon, cls } = badgeConfig;
  return (
    <span className={clsx('badge', cls, className)}>
      {icon}
      {label}
    </span>
  );
}
