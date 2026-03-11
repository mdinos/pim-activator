import { useState, useEffect, useCallback } from 'react';
import { requestActivation, revokeActivation, type ActivationRequest } from '../api/activations';

export type ActivationStatus = 'pending' | 'active' | 'expired' | 'error';

export interface Activation {
  activationId: string;
  roleId: string;
  roleName: string;
  justification: string;
  durationHours: number;
  ticketRef?: string;
  status: ActivationStatus;
  expiresAt?: Date;
  error?: string;
}

export type ActivationMap = Record<string, Activation>;

export function useActivations() {
  const [activations, setActivations] = useState<ActivationMap>({});

  // Tick active → expired when time elapses
  useEffect(() => {
    const id = setInterval(() => {
      setActivations((prev) => {
        const now = Date.now();
        let changed = false;
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          const a = next[key];
          if (a.status === 'active' && a.expiresAt && a.expiresAt.getTime() <= now) {
            next[key] = { ...a, status: 'expired' };
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  const activate = useCallback(async (req: ActivationRequest) => {
    // Optimistically set to pending
    setActivations((prev) => ({
      ...prev,
      [req.roleId]: {
        activationId: '',
        roleId: req.roleId,
        roleName: req.roleName,
        justification: req.justification,
        durationHours: req.durationHours,
        ticketRef: req.ticketRef,
        status: 'pending',
      },
    }));

    try {
      const result = await requestActivation(req);
      setActivations((prev) => ({
        ...prev,
        [req.roleId]: {
          ...prev[req.roleId],
          activationId: result.activationId,
          expiresAt: result.expiresAt,
          status: 'active',
        },
      }));
    } catch (err) {
      setActivations((prev) => ({
        ...prev,
        [req.roleId]: {
          ...prev[req.roleId],
          status: 'error',
          error: err instanceof Error ? err.message : 'Activation failed. Please try again.',
        },
      }));
    }
  }, []);

  const revoke = useCallback(
    async (roleId: string) => {
      const activation = activations[roleId];
      if (!activation) return;

      setActivations((prev) => ({
        ...prev,
        [roleId]: { ...prev[roleId], status: 'pending' },
      }));

      try {
        await revokeActivation(activation.activationId);
        setActivations((prev) => {
          const next = { ...prev };
          delete next[roleId];
          return next;
        });
      } catch {
        // Restore to active if revocation fails
        setActivations((prev) => ({
          ...prev,
          [roleId]: { ...prev[roleId], status: 'active' },
        }));
      }
    },
    [activations],
  );

  const dismiss = useCallback((roleId: string) => {
    setActivations((prev) => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });
  }, []);

  return { activations, activate, revoke, dismiss };
}

/** Format time remaining until expiry as a human-readable string. */
export function formatTimeRemaining(expiresAt: Date): string {
  const ms = expiresAt.getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const totalMins = Math.floor(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m remaining`;
  if (h > 0) return `${h}h remaining`;
  return `${m}m remaining`;
}
