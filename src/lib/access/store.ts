import fs from "node:fs";
import path from "node:path";
import type { AccessDataStore, AccessRequest, AccessAuditLog } from "./types";

const DATA_DIR = path.join(process.cwd(), "private", "data");
const DATA_FILE = path.join(DATA_DIR, "access-requests.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readAccessData(): AccessDataStore {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(DATA_FILE)) {
      const initial: AccessDataStore = { requests: [], logs: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content) as AccessDataStore;
  } catch (err) {
    console.error("Failed to read access data store:", err);
    return { requests: [], logs: [] };
  }
}

export function writeAccessData(data: AccessDataStore): void {
  try {
    ensureDirectoryExists();
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error("Failed to write access data store:", err);
  }
}

export function saveRequest(request: AccessRequest): void {
  const store = readAccessData();
  const index = store.requests.findIndex((r) => r.id === request.id);
  if (index >= 0) {
    store.requests[index] = request;
  } else {
    store.requests.unshift(request);
  }
  writeAccessData(store);
}

export function logAction(
  action: AccessAuditLog["action"],
  requestId?: string,
  details?: string
): void {
  const store = readAccessData();
  const log: AccessAuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    requestId,
    action,
    timestamp: new Date().toISOString(),
    details,
  };
  store.logs.unshift(log);
  // Keep last 500 logs
  if (store.logs.length > 500) {
    store.logs = store.logs.slice(0, 500);
  }
  writeAccessData(store);
}
