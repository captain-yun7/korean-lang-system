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

// 역할이 맞지 않아 요청 경로 대신 대시보드로 보낼 때, 이유를 알려주기 위한 쿼리
export const ROLE_MISMATCH_NOTICE = 'role-mismatch';

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

  // 교사용 주소를 학생에게 공유한 경우처럼, 조용히 튕기지 않고 이유를 전달한다
  if (!isAllowedForRole(decoded, role)) {
    return `${defaultPathFor(role)}?notice=${ROLE_MISMATCH_NOTICE}`;
  }

  return decoded;
}

export function getCallbackUrlFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('callbackUrl');
}
