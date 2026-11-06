export type AccessRequestStatus = "pending" | "approved" | "rejected" | "revoked";

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  reason: string;
  status: AccessRequestStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  expiresAt?: string;
  magicToken?: string;
  sessionToken?: string;
  decisionReason?: string;
}

export interface AccessAuditLog {
  id: string;
  requestId?: string;
  action:
    | "request_submitted"
    | "approved"
    | "rejected"
    | "revoked"
    | "session_authenticated"
    | "session_revoked";
  timestamp: string;
  details?: string;
}

export interface AccessDataStore {
  requests: AccessRequest[];
  logs: AccessAuditLog[];
}
