import { randomUUID } from "node:crypto";
import type {
  CVAccessRecord,
  CVAccessRequest,
  CVAccessResult,
  CVAccessService,
} from "./types";

/**
 * The stand-in until Supabase is wired up.
 *
 * It writes each request to the server log and holds it in memory for the life
 * of the process. That is deliberately not durable: on Vercel each instance has
 * its own memory and instances come and go, so records written here will be
 * lost. It exists so the flow is real end to end and the interface is exercised,
 * not so the log can be relied on.
 */
class MockCVAccessService implements CVAccessService {
  private readonly records: CVAccessRecord[] = [];

  async requestCVAccess(request: CVAccessRequest): Promise<CVAccessResult> {
    const record: CVAccessRecord = {
      id: randomUUID(),
      fullName: request.fullName,
      email: request.email,
      accessedAt: new Date().toISOString(),
      cvVersion: request.cvVersion,
      source: request.source,
    };

    this.records.push(record);

    // The email is logged because recording who asked is the entire point of
    // the feature. It goes to the server log only, and never to the client.
    console.info(
      "[cv-access] granted",
      JSON.stringify({
        id: record.id,
        email: record.email,
        cvVersion: record.cvVersion,
        source: record.source,
        accessedAt: record.accessedAt,
      })
    );

    return { ok: true, record };
  }

  /** Test and debug affordance. Not part of the interface. */
  all(): readonly CVAccessRecord[] {
    return this.records;
  }
}

export const mockCVAccessService = new MockCVAccessService();
