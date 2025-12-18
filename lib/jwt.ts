// JWT 토큰에서 username 추출
export function getUsernameFromToken(token: string | null): string | null {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub || payload.username || null;
  } catch (error) {
    console.error('JWT 토큰 파싱 실패:', error);
    return null;
  }
}

