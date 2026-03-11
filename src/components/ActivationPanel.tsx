import { useState } from 'react';
import {
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  Hourglass,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import type { Role } from '../data/roles';
import type { Activation } from '../hooks/useActivations';
import { formatTimeRemaining } from '../hooks/useActivations';
import type { ActivationRequest } from '../api/activations';

const DURATION_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '2 hours', hours: 2 },
  { label: '4 hours', hours: 4 },
  { label: '8 hours', hours: 8 },
];

interface Props {
  role: Role;
  activation?: Activation;
  onActivate: (req: ActivationRequest) => void;
  onRevoke: (roleId: string) => void;
  onDismiss: (roleId: string) => void;
}

export default function ActivationPanel({ role, activation, onActivate, onRevoke, onDismiss }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [justification, setJustification] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [ticketRef, setTicketRef] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onActivate({
      roleId: role.id,
      roleName: role.name,
      justification,
      durationHours,
      ticketRef: ticketRef.trim() || undefined,
    });
    setFormOpen(false);
  }

  // ── Active state ──────────────────────────────────────────────────────────
  if (activation?.status === 'active') {
    return (
      <div className="border-t border-green-200 bg-green-50 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-green-800 font-semibold text-sm">Role active</p>
              {activation.expiresAt && (
                <p className="text-green-600 text-xs truncate">
                  {formatTimeRemaining(activation.expiresAt)}
                  {activation.ticketRef && <> · {activation.ticketRef}</>}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onRevoke(role.id)}
            className="shrink-0 text-xs font-medium text-green-700 hover:text-red-700 border border-green-300 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Revoke early
          </button>
        </div>
      </div>
    );
  }

  // ── Pending (submitting or revoking) ──────────────────────────────────────
  if (activation?.status === 'pending') {
    return (
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 shrink-0">
        <div className="flex items-center gap-2.5 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium">Submitting activation request…</p>
        </div>
        <p className="text-slate-400 text-xs mt-1 ml-7.5">
          Contacting your platform API — this usually takes a few seconds.
        </p>
      </div>
    );
  }

  // ── Expired state ─────────────────────────────────────────────────────────
  if (activation?.status === 'expired') {
    return (
      <div className="border-t border-amber-200 bg-amber-50 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Hourglass className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-amber-800 font-semibold text-sm">Access expired</p>
              <p className="text-amber-600 text-xs">Your {activation.durationHours}h session has ended.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { onDismiss(role.id); setFormOpen(true); }}
              className="text-xs font-medium bg-amber-700 text-white px-3 py-1.5 rounded-lg hover:bg-amber-800 transition-colors"
            >
              Re-activate
            </button>
            <button
              onClick={() => onDismiss(role.id)}
              className="text-xs font-medium text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (activation?.status === 'error') {
    return (
      <div className="border-t border-red-200 bg-red-50 px-6 py-4 shrink-0">
        <div className="flex items-start gap-2.5">
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-red-800 font-semibold text-sm">Activation failed</p>
            <p className="text-red-600 text-xs mt-0.5">{activation.error}</p>
          </div>
          <button
            onClick={() => onDismiss(role.id)}
            className="shrink-0 text-xs font-medium text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Idle: CTA + expandable form ───────────────────────────────────────────
  return (
    <div className="border-t border-slate-200 bg-white shrink-0">
      {/* Toggle bar */}
      <button
        onClick={() => setFormOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
        aria-expanded={formOpen}
      >
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <span className="font-semibold text-slate-800 text-sm">Request just-in-time access</span>
        </div>
        {formOpen
          ? <ChevronDown className="w-4 h-4 text-slate-400" />
          : <ChevronUp className="w-4 h-4 text-slate-400" />}
      </button>

      {/* Expandable form */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="px-6 pb-5 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex gap-2.5">
            <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-blue-700 text-xs leading-relaxed">
              Access will be granted temporarily and removed automatically at the end of your session.
              All activations are logged for audit purposes.
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              How long do you need access? <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setDurationHours(opt.hours)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors
                    ${durationHours === opt.hours
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Justification */}
          <div>
            <label htmlFor="justification" className="block text-sm font-medium text-slate-700 mb-1.5">
              Why do you need this access? <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="justification"
              required
              minLength={10}
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Deploying the v2.4 release to production as part of change CHG-1234"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Ticket reference (optional) */}
          <div>
            <label htmlFor="ticket-ref" className="block text-sm font-medium text-slate-700 mb-1.5">
              Change / ticket reference <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="ticket-ref"
              type="text"
              value={ticketRef}
              onChange={(e) => setTicketRef(e.target.value)}
              placeholder="e.g. CHG-1234, JIRA-567"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Activate {role.name}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
