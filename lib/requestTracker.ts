// 전역 요청 추적을 위한 유틸리티

const pendingRequests = new Map<string, AbortController>();

export function createRequestKey(method: string, url: string, params?: unknown): string {
  const paramsStr = params ? JSON.stringify(params) : '';
  return `${method}:${url}:${paramsStr}`;
}

export function getAbortController(key: string): AbortController | null {
  return pendingRequests.get(key) || null;
}

export function setAbortController(key: string, controller: AbortController): void {
  // 기존 요청이 있으면 취소
  const existing = pendingRequests.get(key);
  if (existing) {
    existing.abort();
  }
  pendingRequests.set(key, controller);
}

export function removeAbortController(key: string): void {
  pendingRequests.delete(key);
}

export function cancelRequest(key: string): void {
  const controller = pendingRequests.get(key);
  if (controller) {
    controller.abort();
    pendingRequests.delete(key);
  }
}

