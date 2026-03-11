import { X, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react';
import { useState } from 'react';
import type { Permission, Role } from '../data/roles';
import PermissionBadge from './PermissionBadge';
import RoleIcon from './RoleIcon';
import { getRoleColors } from './roleColors';

interface Props {
  role: Role;
  onClose: () => void;
}

function groupByService(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.service] ??= []).push(p);
    return acc;
  }, {});
}

function ServiceGroup({ service, permissions, defaultOpen = true }: { service: string; permissions: Permission[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-700 text-sm">{service}</span>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-xs">{permissions.length} permission{permissions.length !== 1 ? 's' : ''}</span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {open && (
        <ul className="divide-y divide-slate-100">
          {permissions.map((permission) => (
            <li key={permission.action} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <PermissionBadge type={permission.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 text-sm">{permission.displayName}</p>
                  <p className="text-slate-500 text-sm mt-0.5">{permission.description}</p>
                  <code className="mt-1.5 inline-block text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono break-all">
                    {permission.action}
                  </code>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RoleDetail({ role, onClose }: Props) {
  const colors = getRoleColors(role.color);
  const grouped = groupByService(role.permissions);

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`${colors.bg} border-b ${colors.border} px-6 py-5 shrink-0`}>
          <div className="flex items-start gap-4">
            <div className={`${colors.iconBg} ${colors.text} p-3 rounded-xl shrink-0`}>
              <RoleIcon name={role.icon} className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="detail-title" className={`text-lg font-bold ${colors.text} leading-tight`}>
                {role.name}
              </h2>
              <p className="text-slate-600 text-sm mt-1">{role.shortDescription}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-white/60"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {role.tags.map((tag) => (
              <span key={tag} className={`text-xs font-medium ${colors.iconBg} ${colors.text} px-2.5 py-0.5 rounded-full border ${colors.border}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Description */}
          <section aria-labelledby="desc-heading">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-slate-400" />
              <h3 id="desc-heading" className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                What this role allows
              </h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{role.fullDescription}</p>
          </section>

          {/* Use cases */}
          <section aria-labelledby="usecases-heading">
            <h3 id="usecases-heading" className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-2">
              Common use cases
            </h3>
            <ul className="space-y-1.5">
              {role.useCases.map((uc) => (
                <li key={uc} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${colors.iconBg} border-2 ${colors.border} shrink-0`} aria-hidden="true" />
                  {uc}
                </li>
              ))}
            </ul>
          </section>

          {/* Allowed permissions */}
          <section aria-labelledby="perms-heading">
            <h3 id="perms-heading" className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">
              Included permissions ({role.permissions.length})
            </h3>
            <div className="space-y-2">
              {Object.entries(grouped).map(([service, permissions], i) => (
                <ServiceGroup key={service} service={service} permissions={permissions} defaultOpen={i === 0} />
              ))}
            </div>
          </section>

          {/* Denied permissions */}
          {role.notActions.length > 0 && (
            <section aria-labelledby="denied-heading">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 id="denied-heading" className="font-semibold text-red-700 text-sm uppercase tracking-wide">
                  Explicitly denied ({role.notActions.length})
                </h3>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                <ul className="divide-y divide-red-100">
                  {role.notActions.map((permission) => (
                    <li key={permission.action} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <PermissionBadge type={permission.type} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-red-800 text-sm">{permission.displayName}</p>
                          <p className="text-red-600 text-sm mt-0.5">{permission.description}</p>
                          <code className="mt-1.5 inline-block text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded font-mono break-all">
                            {permission.action}
                          </code>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
