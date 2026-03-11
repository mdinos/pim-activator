import { ChevronRight, CheckCircle2, Loader2, Hourglass } from 'lucide-react';
import type { Role } from '../data/roles';
import type { Activation } from '../hooks/useActivations';
import RoleIcon from './RoleIcon';
import { getRoleColors } from './roleColors';
import { formatTimeRemaining } from '../hooks/useActivations';

interface Props {
  role: Role;
  searchQuery: string;
  activation?: Activation;
  onClick: () => void;
}

function ActivationBadge({ activation }: { activation: Activation }) {
  if (activation.status === 'pending') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
        Activating…
      </span>
    );
  }
  if (activation.status === 'active') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
        {activation.expiresAt ? formatTimeRemaining(activation.expiresAt) : 'Active'}
      </span>
    );
  }
  if (activation.status === 'expired') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
        <Hourglass className="w-3 h-3" aria-hidden="true" />
        Expired
      </span>
    );
  }
  return null;
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function RoleCard({ role, searchQuery, activation, onClick }: Props) {
  const colors = getRoleColors(role.color);
  const permissionCount = role.permissions.length;
  const serviceCount = new Set(role.permissions.map((p) => p.service)).size;
  const isActive = activation?.status === 'active';

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-xl border transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
        isActive
          ? 'border-green-300 bg-white shadow-md shadow-green-100 hover:shadow-lg hover:shadow-green-100'
          : `${colors.border} bg-white hover:shadow-md`
      }`}
      aria-label={`View details for ${role.name}`}
    >
      {/* Header stripe */}
      <div className={`${colors.bg} rounded-t-xl px-5 py-4 border-b ${colors.border}`}>
        <div className="flex items-start gap-3">
          <div className={`${colors.iconBg} ${colors.text} p-2.5 rounded-lg shrink-0`}>
            <RoleIcon name={role.icon} className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={`font-semibold text-base ${colors.text} leading-snug`}>
              {highlight(role.name, searchQuery)}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5 leading-snug">
              {highlight(role.shortDescription, searchQuery)}
            </p>
          </div>
          <ChevronRight className={`${colors.text} w-4 h-4 mt-0.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity`} />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {role.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
            >
              {highlight(tag, searchQuery)}
            </span>
          ))}
        </div>

        {/* Stats + activation badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-4 text-sm text-slate-500">
            <span>
              <span className={`font-semibold ${colors.text}`}>{permissionCount}</span> permission{permissionCount !== 1 ? 's' : ''}
            </span>
            <span>
              <span className={`font-semibold ${colors.text}`}>{serviceCount}</span> Azure service{serviceCount !== 1 ? 's' : ''}
            </span>
            {role.notActions.length > 0 && (
              <span>
                <span className="font-semibold text-red-600">{role.notActions.length}</span> denied
              </span>
            )}
          </div>
          {activation && <ActivationBadge activation={activation} />}
        </div>
      </div>
    </button>
  );
}
