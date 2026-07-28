type Role = 'TEACHER' | 'STUDENT' | undefined;

function defaultPathFor(role: Role): string {
  return role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard';
}

// 오픈 리디렉트 방지: 같은 사이트의 절대 경로만 허용
function isSafeInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');
}

function isAllowedForRole(path: string, role: Role): boolean {
  if (path.startsWith('/teacher')) return role === 'TEACHER';
  if (path.startsWith('/student')) return role === 'STUDENT';
  return true;
}

// 로그인 후 이동할 경로 결정. 공유받은 링크(callbackUrl)가 유효하면 그쪽으로 보낸다.
export function resolveLoginRedirect(role: Role, callbackUrl?: string | null): string {
  if (!callbackUrl) return defaultPathFor(role);

  const decoded = (() => {
    try {
      return decodeURIComponent(callbackUrl);
    } catch {
      return callbackUrl;
    }
  })();

  if (!isSafeInternalPath(decoded)) return defaultPathFor(role);
  if (decoded === '/' || decoded.startsWith('/login')) return defaultPathFor(role);
  if (!isAllowedForRole(decoded, role)) return defaultPathFor(role);

  return decoded;
}

export function getCallbackUrlFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('callbackUrl');
}
