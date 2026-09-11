export async function fetchJson(fetchFn, url, { method = 'GET', headers = {}, body, timeoutMs = 15000 } = {}) {
  let timer;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  if (controller && timeoutMs > 0) timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchFn(url, {
      method,
      headers: { accept: 'application/json', ...headers },
      ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
      ...(controller ? { signal: controller.signal } : {}),
    });
    const text = await response.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }
    return { ok: response.ok, status: response.status, data, headers: response.headers };
  } catch (error) {
    return { ok: false, status: null, error: error?.name === 'AbortError' ? 'timeout' : 'network_error', detail: String(error?.message ?? error) };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function clamp(value, min, max, fallback = min) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export function isoNow(now = () => new Date()) { return now().toISOString(); }

export function sourceMeta({ source, sourceType = 'public_api', confidence = 0.9, estimated = false, authoritative = false, observedAt = new Date().toISOString(), extra = {} }) {
  return { source, sourceType, confidence, estimated, authoritative, observedAt, ...extra };
}
