/**
 * Human-readable message from an Axios/fetch-style error (handles non-JSON bodies).
 */
export function getApiErrorMessage(error) {
  if (error?.apiMessage) return error.apiMessage;

  const res = error?.response;
  if (!res) {
    if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
      return 'Network error — API unreachable. Check that the backend is running or VITE_API_PROXY_TARGET is correct.';
    }
    return error?.message || 'Request failed';
  }

  const { status, statusText, data } = res;

  if (data != null && typeof data === 'object') {
    return (
      data.message ||
      data.error ||
      data.errorCode ||
      (Array.isArray(data.errors) &&
        data.errors.map((e) => e.issue || e.message || e).join(', ')) ||
      statusText ||
      `Request failed (${status})`
    );
  }

  if (typeof data === 'string' && data.trim()) {
    const s = data.trim();
    if (s.startsWith('<')) {
      return `Server returned HTML (${status}) instead of JSON — often a bad proxy URL, crashed backend, or Railway gateway error. Open Network tab → register → Response, and check Railway deploy logs.`;
    }
    return s.length > 300 ? `${s.slice(0, 300)}…` : s;
  }

  return statusText || `Request failed (${status})`;
}
