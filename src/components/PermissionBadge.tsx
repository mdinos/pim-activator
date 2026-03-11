import type { PermissionType } from '../data/roles';

const config: Record<PermissionType, { label: string; className: string }> = {
  read: {
    label: 'Read',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  write: {
    label: 'Write',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  delete: {
    label: 'Delete',
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
  action: {
    label: 'Action',
    className: 'bg-purple-100 text-purple-700 border border-purple-200',
  },
};

export default function PermissionBadge({ type }: { type: PermissionType }) {
  const { label, className } = config[type];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
