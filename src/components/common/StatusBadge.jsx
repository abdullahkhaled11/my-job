import { STATUS_LABELS } from '../../data/seedData';

export function StatusBadge({ status, className = '' }) {
  let statusClass = 'not_started';
  let icon = null;

  if (status === 'completed') {
    statusClass = 'completed';
    icon = ' ✓';
  } else if (status === 'in_progress') {
    statusClass = 'in_progress';
  }

  return (
    <span className={`status-badge ${statusClass} ${className}`}>
      {STATUS_LABELS[status] || 'غير محدد'}
      {icon}
    </span>
  );
}
