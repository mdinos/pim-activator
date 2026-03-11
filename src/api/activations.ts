/**
 * JIT Activation API layer
 *
 * This file is the single integration point for your platform's activation API.
 * Swap the simulated implementations below for real HTTP calls — for example:
 *
 *   PUT https://<your-platform-api>/activations
 *
 * Or directly against Azure PIM (Privileged Identity Management):
 *   PUT https://management.azure.com/subscriptions/{subscriptionId}/providers/
 *       Microsoft.Authorization/roleEligibilityScheduleRequests/{requestId}?api-version=2022-04-01
 *
 * Required Azure RBAC scope: Microsoft.Authorization/roleEligibilityScheduleRequests/write
 */

export interface ActivationRequest {
  roleId: string;
  roleName: string;
  justification: string;
  durationHours: number;
  ticketRef?: string;
}

export interface ActivationResponse {
  activationId: string;
  expiresAt: Date;
}

/** Submit a JIT role activation request. */
export async function requestActivation(req: ActivationRequest): Promise<ActivationResponse> {
  // ----- Replace this block with your real API call -----
  void req;
  await delay(1800);
  // -------------------------------------------------------

  return {
    activationId: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + req.durationHours * 60 * 60 * 1000),
  };
}

/** Revoke an active activation before it expires. */
export async function revokeActivation(activationId: string): Promise<void> {
  // ----- Replace this block with your real API call -----
  void activationId;
  await delay(900);
  // -------------------------------------------------------
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
