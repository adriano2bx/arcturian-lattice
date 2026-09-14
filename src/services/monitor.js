import { CompetitiveService } from './competitive.js';
import { WebProfileService } from './web-profile.js';
import { JudiciarioMcpProvider } from '../providers/judiciario-mcp.js';

const VOLATILE_KEYS = new Set([
  'cf-ray',
  'ttl',
  'generationtime_ms',
  'requestid',
  'request_id',
  'traceid',
  'trace_id',
]);

export class MonitorService {
  constructor({ db = null, fetchFn = globalThis.fetch, now = () => new Date(), judiciarioEndpoint = null, judiciarioBearerToken = null } = {}) {
    this.db = db;
    this.fetchFn = fetchFn;
    this.now = now;
    this.judiciarioEndpoint = judiciarioEndpoint;
    this.judiciarioBearerToken = judiciarioBearerToken;
  }

  configured() {
    return Boolean(this.db?.prepare);
  }

  async create({ name, type, target, intervalMinutes = 1440 }) {
    if (!this.configured()) return noDb();

    const id = crypto.randomUUID();
    const now = this.now().toISOString();
    const next = new Date(this.now().getTime() + intervalMinutes * 60000).toISOString();

    await this.db
      .prepare(`INSERT INTO monitors(id,name,type,target,interval_minutes,enabled,next_run_at,created_at,updated_at) VALUES(?,?,?,?,?,1,?,?,?)`)
      .bind(id, name, type, target, intervalMinutes, next, now, now)
      .run();

    return { ok: true, id, name, type, target, intervalMinutes, nextRunAt: next };
  }

  async list() {
    if (!this.configured()) return noDb();

    const r = await this.db
      .prepare(`SELECT id,name,type,target,interval_minutes,enabled,last_run_at,next_run_at,created_at,updated_at FROM monitors ORDER BY created_at DESC`)
      .all();

    return { ok: true, monitors: r?.results ?? [] };
  }

  async run(id) {
    if (!this.configured()) return noDb();

    const row = await this.db.prepare(`SELECT * FROM monitors WHERE id=?`).bind(id).first();
    if (!row) return { ok: false, reason: 'not_found' };

    const payload = await this.#collect(row.type, row.target);
    const observed = this.now().toISOString();
    const next = new Date(this.now().getTime() + Number(row.interval_minutes) * 60000).toISOString();

    if (!isUsableCollection(row.type, payload)) {
      await this.db
        .prepare(`UPDATE monitors SET last_run_at=?,next_run_at=?,updated_at=? WHERE id=?`)
        .bind(observed, next, observed, id)
        .run();

      return {
        ok: false,
        id,
        reason: 'collection_failed',
        persisted: false,
        observedAt: observed,
        nextRunAt: next,
        payload,
      };
    }

    const rawJson = JSON.stringify(payload);
    const semanticHash = await hashPayload(payload);

    const prev = await this.db
      .prepare(`SELECT id,content_hash,payload_json,observed_at FROM snapshots WHERE monitor_id=? ORDER BY observed_at DESC LIMIT 1`)
      .bind(id)
      .first();

    const previousHash = prev ? await hashPreviousSnapshot(prev) : null;
    const changed = !prev || previousHash !== semanticHash;

    await this.db
      .prepare(`INSERT INTO snapshots(id,monitor_id,content_hash,payload_json,observed_at) VALUES(?,?,?,?,?)`)
      .bind(crypto.randomUUID(), id, semanticHash, rawJson, observed)
      .run();

    if (changed && prev) {
      await this.db
        .prepare(`INSERT INTO intelligence_events(id,monitor_id,event_type,summary,previous_hash,current_hash,created_at) VALUES(?,?,?,?,?,?,?)`)
        .bind(
          crypto.randomUUID(),
          id,
          'change_detected',
          `Change detected for ${row.target}`,
          previousHash,
          semanticHash,
          observed,
        )
        .run();
    }

    await this.db
      .prepare(`UPDATE monitors SET last_run_at=?,next_run_at=?,updated_at=? WHERE id=?`)
      .bind(observed, next, observed, id)
      .run();

    return {
      ok: true,
      id,
      changed,
      previousHash,
      currentHash: semanticHash,
      observedAt: observed,
      nextRunAt: next,
      payload,
    };
  }

  async runDue({ limit = 5 } = {}) {
    if (!this.configured()) return noDb();

    const now = this.now().toISOString();
    const r = await this.db
      .prepare(`SELECT id FROM monitors WHERE enabled=1 AND next_run_at<=? ORDER BY next_run_at ASC LIMIT ?`)
      .bind(now, limit)
      .all();

    const results = [];
    for (const row of r?.results ?? []) {
      results.push(await this.run(row.id));
    }

    return { ok: true, ran: results.length, results };
  }

  async events({ monitorId = null, limit = 50 } = {}) {
    if (!this.configured()) return noDb();

    const sql = monitorId
      ? `SELECT * FROM intelligence_events WHERE monitor_id=? ORDER BY created_at DESC LIMIT ?`
      : `SELECT * FROM intelligence_events ORDER BY created_at DESC LIMIT ?`;

    const stmt = this.db.prepare(sql);

    const r = monitorId
      ? await stmt.bind(monitorId, limit).all()
      : await stmt.bind(limit).all();

    return { ok: true, events: r?.results ?? [] };
  }

  async #collect(type, target) {
    if (type === 'web_profile') {
      return new WebProfileService({ fetchFn: this.fetchFn }).inspect(target);
    }

    if (type === 'competitive_snapshot') {
      return new CompetitiveService({ fetchFn: this.fetchFn }).snapshot(target);
    }

    if (type === 'legal_publications') {
      let query;
      try { query = typeof target === 'string' ? JSON.parse(target) : target; } catch { return { ok: false, status: 'failed', reason: 'invalid_target_json' }; }
      if (!query?.name) return { ok: false, status: 'failed', reason: 'legal_name_required' };
      return new JudiciarioMcpProvider({ fetchFn: this.fetchFn, endpoint: this.judiciarioEndpoint, bearerToken: this.judiciarioBearerToken }).searchByParty(query);
    }

    throw new Error(`Unsupported monitor type: ${type}`);
  }
}

export function canonicalizeForChangeDetection(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => canonicalizeForChangeDetection(item))
      .sort((a, b) => stableJson(a).localeCompare(stableJson(b)));
  }

  if (value && typeof value === 'object') {
    const out = {};

    for (const key of Object.keys(value).sort()) {
      if (VOLATILE_KEYS.has(key.toLowerCase())) continue;
      out[key] = canonicalizeForChangeDetection(value[key]);
    }

    return out;
  }

  return value;
}

export function isUsableCollection(type, payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.status === 'failed') return false;

  if (type === 'competitive_snapshot') {
    const components = Object.values(payload.components ?? []);

    if (!components.length) return false;

    return components.some(
      (component) =>
        component &&
        typeof component === 'object' &&
        component.ok !== false &&
        component.status !== 'failed',
    );
  }

  return true;
}

async function hashPayload(payload) {
  return sha256(stableJson(canonicalizeForChangeDetection(payload)));
}

async function hashPreviousSnapshot(prev) {
  if (!prev?.payload_json) {
    return prev?.content_hash ?? null;
  }

  try {
    return await hashPayload(JSON.parse(prev.payload_json));
  } catch {
    return prev?.content_hash ?? null;
  }
}

function stableJson(value) {
  return JSON.stringify(value);
}

function noDb() {
  return {
    ok: false,
    reason: 'dataset_not_configured',
    detail: 'Bind D1 as DB and apply migrations.',
  };
}

async function sha256(text) {
  const b = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );

  return [...new Uint8Array(b)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}
