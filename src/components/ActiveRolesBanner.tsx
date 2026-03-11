import { useEffect, useState } from 'react';
import { CheckCircle2, Hourglass, X } from 'lucide-react';
import type { ActivationMap } from '../hooks/useActivations';
import { formatTimeRemaining } from '../hooks/useActivations';

interface Props {
  activations: ActivationMap;
  onRevoke: (roleId: string) => void;
  onDismiss: (roleId: string) => void;
}

export default function ActiveRolesBanner({ activations, onRevoke, onDismiss }: Props) {
  // Re-render every 30s so the time-remaining text stays fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const entries = Object.values(activations).filter(
    (a) => a.status === 'active' || a.status === 'expired',
  );

  if (entries.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white border-b border-slate-700 px-4 sm:px-6 py-2.5" role="status" aria-live="polite">
      <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">
          Active access
        </span>
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {entries.map((a) => (
            <div
              key={a.roleId}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                a.status === 'active'
                  ? 'bg-green-900/60 border-green-700 text-green-300'
                  : 'bg-amber-900/60 border-amber-700 text-amber-300'
              }`}
            >
              {a.status === 'active'
                ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                : <Hourglass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
              <span>{a.roleName}</span>
              {a.status === 'active' && a.expiresAt && (
                <span className="text-green-500">· {formatTimeRemaining(a.expiresAt)}</span>
              )}
              {a.status === 'expired' && (
                <span className="text-amber-500">· expired</span>
              )}
              {a.status === 'active' ? (
                <button
                  onClick={() => onRevoke(a.roleId)}
                  className="ml-0.5 text-green-500 hover:text-white transition-colors"
                  aria-label={`Revoke ${a.roleName}`}
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => onDismiss(a.roleId)}
                  className="ml-0.5 text-amber-500 hover:text-white transition-colors"
                  aria-label={`Dismiss ${a.roleName}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
